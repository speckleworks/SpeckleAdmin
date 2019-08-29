<template>
  <div id="clientGraph">
    <svg width="100%" :height="svgHeight" id="graphLayout">
      <g v-show="showDocGroups.includes(1)" id="hullDoc" />
      <g v-show="showDocGroups.includes(2)" id="hullOwner" />
      <g id="pathLink" />
      <g id="marker" />
      <g id="circleSender" />
      <g id="circleReceiver" />
      <g id="rectStream" />
      <g id="text" />
    </svg>
  </div>
</template>

<script src="./node_modules/vue-slider-component/dist/vue-slider-component.umd.min.js"></script>

<script>
import * as d3 from "d3";
export default {
  name: "ForceDirectedLayout",

  props: {
    clientdata: Array,
    svgHeight: Number,
    showDocGroups: Array,
    clientdatafilter: Array,
    timeFilter: Array,
    toggleDrag: Boolean,

    documentLinksForce: Number,
    switchForce: Boolean,
    linearcs: Boolean
  },

  watch: {
    linearcs: function() {
      this.drawGraph.tick();
    },
    switchForce: function() {
      if (this.switchForce) {
        this.$data.force
          .links(
            this.forceLinks.filter(d => d.type != "documentGuidForceGroup")
          )
          .start();
      } else {
        this.$data.force
          .links(this.forceLinks.filter(d => d.type != "ownerForceGroup"))
          .start();
      }
    },

    documentLinksForce: function() {
      this.$data.force
        .linkDistance(d => {
          if (d.type == "ownerForceGroup") {
            return this.documentLinksForce;
          } else if (d.type == "documentGuidForceGroup") {
            return this.documentLinksForce;
          } else {
            return 116;
          }
        })
        .start();
    },
    toggleDrag: function() {
      if (this.toggleDrag) {
        d3.selectAll("circle").classed("fixed", d => {
          d.fixed = true;
        });
        d3.selectAll("rect").classed("fixed", d => {
          d.fixed = true;
        });
      } else {
        d3.selectAll("circle").classed("fixed", d => {
          d.fixed = false;
        });
        d3.selectAll("rect").classed("fixed", d => {
          d.fixed = false;
        });
      }
    },
    clientdatafilter: function() {
      console.log("ooups");
      console.log(this.timeFilter);
    },

    timeFilter: function() {
      this.updateDisplayNodes("#circleSender");
      this.updateDisplayNodes("#circleReceiver");
      this.updateDisplayNodes("#rectStream");
      this.updateDisplayNodes("#text");
      this.updateDisplayLinks("#pathLink");
    }
  },

  data: () => ({
    forceLinks: [],
    shiftKey: null,
    ctrlKey: null,
    filteredNodes: null,
    colour: null,
    groupPath: null,
    force: null,

    svgWidth: document.getElementById("appClientGraph").offsetWidth,
    menuStream: [
      {
        title: "View Stream",
        action: function(d, i) {
          var data = d3.select(d).datum();
          console.log(data);
          var url = "https://hestia.speckle.works/#/view/" + data.streamId;
          window.open(url, "_blank").focus();
        },
        disabled: false // optional, defaults to false
      },
      {
        title: "View Stream Data",
        action: function(d, i) {
          var data = d3.select(d).datum();
          var url = "https://hestia.speckle.works/api/streams/" + data.streamId;
          window.open(url, "_blank").focus();
        }
      },
      {
        title: "View Connected Clients",
        action: function(d, i) {
          var data = d3.select(d).datum();
          var url =
            "https://hestia.speckle.works/api/streams/" +
            data.streamId +
            "/clients";
          window.open(url, "_blank").focus();
        }
      }
    ],
    menuClient: [
      {
        title: "Client Info",
        action: function(d, i) {
          var data = d3.select(d).datum();
          window.alert(
            d3.select(d).datum().documentType +
              ": " +
              d3.select(d).datum().documentName +
              "\n" +
              "Created at" +
              ": " +
              d3.select(d).datum().createdAt +
              "\n" +
              "Updated at" +
              ": " +
              d3.select(d).datum().updatedAt +
              "\n" +
              "Owner is" +
              ": " +
              d3.select(d).datum().owner
          );
        }
      }
    ]
  }),

  methods: {


    updateDisplayLinks(id) {
      console.log(this.timeFilter[0]);
      var context = this;
      Array.from(document.querySelector(id).children).forEach(function(node) {
        var nodeTimeComparerSource =
          new Date(node.getAttribute("source_timestamp"))
            .toISOString()
            .split(".")[0] + ".000Z";
        var nodeTimeComparerTarget =
          new Date(node.getAttribute("target_timestamp"))
            .toISOString()
            .split(".")[0] + ".000Z";

        if (
          nodeTimeComparerSource >= context.timeFilter[0] &&
          nodeTimeComparerSource <= context.timeFilter[1] &&
          (nodeTimeComparerTarget >= context.timeFilter[0] &&
            nodeTimeComparerTarget <= context.timeFilter[1])
        ) {
          node.style.opacity = 1;
        } else {
          node.style.opacity = 0.2;
        }
      });
    },
    updateDisplayNodes(id) {
      var context = this;

      Array.from(document.querySelector(id).children).forEach(function(node) {
        var nodeTimeComparer =
          new Date(node.getAttribute("timestamp")).toISOString().split(".")[0] +
          ".000Z";
        if (
          nodeTimeComparer >= context.timeFilter[0] &&
          nodeTimeComparer <= context.timeFilter[1]
        ) {
          //node.style.display = "block"
          node.style.opacity = 1;
        } else {
          //node.style.display = "none"
          node.style.opacity = 0.2;
        }
      });
    },

    contextMenu(type, menu, openCallback) {
      // create the div element that will hold the context menu
      d3.selectAll(".d3-context-menu")
        .data([1])
        .enter()
        .append("div")
        .attr("class", "d3-context-menu");

      // close menu
      d3.select(".application--wrap").on("click.d3-context-menu", function() {
        d3.select(".d3-context-menu").style("display", "none");
      });

      // this gets executed when a contextmenu event occurs
      return function(data, index) {
        var elm = this;

        d3.selectAll(".d3-context-menu").html("");
        var list = d3.selectAll(".d3-context-menu").append("ul");
        list
          .selectAll("li")
          .data(menu)
          .enter()
          .append("li")
          .attr("class", type)
          .html(function(d) {
            return d.title;
          })
          .on("click", function(d, i) {
            d.action(elm, data, index);
            d3.select(".d3-context-menu").style("display", "none");
          });

        // the openCallback allows an action to fire before the menu is displayed
        // an example usage would be closing a tooltip
        if (openCallback) openCallback(data, index);

        // display context menu.
        d3.select(".d3-context-menu")
          .style("left", d3.event.pageX - 2 + "px")
          .style("top", d3.event.pageY - 2 + "px")
          .style("display", "block");

        d3.event.preventDefault();
      };
    },
    groupBy(arr, property) {
      return arr.reduce(function(memo, x) {
        if (!memo[x[property]]) {
          memo[x[property]] = [];
        }
        memo[x[property]].push(x);
        return memo;
      }, {});
    },

    drawGraph() {
      var _nodes = this.clientdata[0];
      var links = this.clientdata[1];

      // Sorts all nodes by creation timestamps
      _nodes.sort(function(a, b) {
        return a.createdAt < b.createdAt
          ? -1
          : a.createdAt > b.createdAt
          ? 1
          : 0;
      });

      console.log(_nodes);
      console.log(links);

      var thisContext = this;

      for (let i = 0; i < links.length; i++) {
        if (links[i].action === "sending") {
          let source = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e._id;
              }
            })
            .indexOf(links[i].source);

          // defines a source per client
          let sourceClient = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e._id;
              }
            })
            .indexOf(links[i].sourceClient);

          // defines a source per document
          let sourceDoc = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e.documentGuid;
              }
            })
            .indexOf(links[i].sourceDoc);

          let target = _nodes
            .map(function(e) {
              return e._id;
            })
            .indexOf(links[i].target);

          console.log(source);
          console.log(sourceDoc);
          console.log("ahhaha");
          thisContext.forceLinks.push({
            source,
            sourceDoc,
            sourceClient,
            target,
            type: `sending`,
            display: true
          });
        }
        if (links[i].action === "receiving") {
          let source = _nodes
            .map(function(e) {
              return e._id;
            })
            .indexOf(links[i].source);

          let target = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e._id;
              }
            })
            .indexOf(links[i].target);

          // defines a target per document
          let targetDoc = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e.documentGuid;
              }
            })
            .indexOf(links[i].targetDoc);

          // defines a target per client
          let targetClient = _nodes
            .map(function(e) {
              if (e.type === "Client") {
                return e._id;
              }
            })
            .indexOf(links[i].targetClient);

          thisContext.forceLinks.push({
            source,
            target,
            targetDoc,
            targetClient,
            type: `receiving`,
            display: true
          });
        }
      }

      let clientNodes = _nodes.filter(data => data.type == "Client");
      var parentGroups = this.groupBy(clientNodes, "owner");

      for (var property in parentGroups) {
        var parGroup = parentGroups[property];
        for (let i = 0; i < parGroup.length - 1; i++) {
          for (let j = i + 1; j < parGroup.length; j++) {
            thisContext.forceLinks.push({
              source: parGroup[i],
              target: parGroup[j],
              type: "ownerForceGroup",
              display: false
            });
          }
        }
      }

      var childGroups = this.groupBy(clientNodes, "documentGuid");
      for (var property in childGroups) {
        var childGroup = childGroups[property];
        for (let i = 0; i < childGroup.length - 1; i++) {
          for (let j = i + 1; j < childGroup.length; j++) {
            thisContext.forceLinks.push({
              source: childGroup[i],
              target: childGroup[j],
              type: "documentGuidForceGroup",
              display: false
            });
          }
        }
      }

      var svg = d3
        .select("#graphLayout")

      this.$data.force = d3.layout
        .force()
        .nodes(d3.values(_nodes))
        .links(thisContext.forceLinks)
        .size([this.$data.svgWidth, this.$props.svgHeight])
        .linkDistance(d => {
          if (d.type == "ownerForceGroup") {
            return this.documentLinksForce;
          } else if (d.type == "documentGuidForceGroup") {
            return this.documentLinksForce;
          } else {
            return 116;
          }
        })
        .charge(d => {
          if (d.type == "ownerForceGroup") {
            return 1000;
          } else if (d.type == "documentGuidForceGroup") {
            return 1000;
          } else {
            return -1000;
          }
        })
        .on("tick", tick);

      if (this.switchForce) {
        // docs
        var filterLinks = this.forceLinks.filter(
          d => d.type != "documentGuidForceGroup"
        );
        this.$data.force.links(filterLinks).start();
      } else {
        var filterLinks = this.forceLinks.filter(
          d => d.type != "ownerForceGroup"
        );
        this.$data.force.links(filterLinks).start();
      }

      this.$data.colour = d3.scale
        .linear()
        .domain([0, _nodes.length - 1])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("lightgray"), d3.rgb("blue")]);

      var xScale = d3.scale
        .linear()
        .domain([0, this.svgWidth])
        .range([0, this.svgWidth]);
      var yScale = d3.scale
        .linear()
        .domain([0, this.svgHeight])
        .range([0, this.svgHeight]);






      // Define the div for the tooltip
      var divCircle = d3.select(".tooltip").style("opacity", 0);
      var divOwner = d3.select(".tooltipOwner").style("opacity", 0);
      var divDoc = d3.select(".tooltipDoc").style("opacity", 0);

      //

      svg
        .select("#hullOwner")
        .selectAll("path")
        .data(Object.keys(parentGroups))
        .enter()
        .append("path")

        .attr("class", "subhullOwner")

        .on("mouseover", function(d) {
          divOwner.style("opacity", 0.8);
          divOwner
            .html(`Owner: ${d.values[0].owner}`)
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY - 28 + "px");
        })
        .on("mouseout", function(d) {
          divOwner.style("opacity", 0);
        });
      svg.select("#hullOwner").selectAll("path");

      var childGroups = this.groupBy(clientNodes, "documentGuid");

      svg
        .select("#hullDoc")
        .selectAll("path")
        .data(Object.keys(childGroups))
        .enter()
        .append("path")
        .attr("class", "subhullDoc")
        .on("mouseover", function(d) {
          divDoc.style("opacity", 0.8);
          divDoc
            .html(
              `DocumentGuid: ${d.values[0].documentGuid}<br/>
            DocumentType: ${d.values[0].documentType}<br/>
            DocumentName: ${d.values[0].documentName}`
            )
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY - 28 + "px");
        })
        .on("mouseout", function(d) {
          divDoc.style("opacity", 0);
        });

      var groupOwners = d3
        .nest()
        .key(function(d) {
          return d.owner;
        })
        .entries(
          this.$data.force.nodes().filter(data => data.type == "Client")
        );

      var groupDocs = d3
        .nest()
        .key(function(d) {
          return d.documentGuid;
        })
        .entries(
          this.$data.force.nodes().filter(data => data.type == "Client")
        );

      var groupPath = function(d) {
        return (
          "M" +
          d3.geom
            .hull(
              d.values.map(function(i) {
                return [i.x, i.y];
              })
            )
            .join("L") +
          "Z"
        );
      };

      //
      svg
        .select("#marker")
        .selectAll("marker")
        .data(this.$data.force.links().filter(data => data.display))
        //.data(['sending', 'receiving'])
        .enter()
        .append("svg:marker")
        .attr("source_timestamp", data => data.source.createdAt)
        .attr("target_timestamp", data => data.target.createdAt)
        .attr("id", data => data.type)
        .attr("viewBox", "0 -5 10 10")
        // handles the size difference between streams and client
        .attr("refX", data => {
          //console.log(data);
          if (data.type === "sending") {
            return 21;
          } else if (data.type === "receiving") {
            //console.log(data);
            return 15;
          }
        })
        .attr("refY", 0)
        .attr("markerWidth", 7)
        .attr("markerHeight", 12)
        .attr("orient", "auto")
        .attr("fill-opacity", 1)
        //.attr("fill", data => this.colour(data.target.index))
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");
      var path = svg
        .select("#pathLink")
        .selectAll("path")
        .data(this.$data.force.links().filter(data => data.display))
        .enter()
        .append("svg:path")
        .attr("source_timestamp", data => data.source.createdAt)
        .attr("target_timestamp", data => data.target.createdAt)
        .attr("class", function(d) {
          return "link " + d.type;
        })

        .attr("marker-end", function(d) {
          return "url(#" + d.type + ")";
        });
      //
      //
      var circleSender = svg
        .select("#circleSender")
        .selectAll("circle")
        .data(this.$data.force.nodes().filter(data => data.role == "Sender"))
        .enter()
        .append("svg:circle")
        .attr("class", "sender")
        .attr("class", "node")
        .attr("r", 6)
        .attr("timestamp", function(d) {
          return d.createdAt;
        })
        .on("dblclick", dblclick)
        .call(this.$data.force.drag)
        // .on("mouseover", function(d) {
        //   divCircle.
        //       style("opacity", .8);
        //       divCircle.html(`Owner: ${d.owner}<br/>
        //       ${d.documentType}: ${d.documentName}<br/>
        //       Created at: ${d.createdAt}<br/>
        //       Updated at: ${d.updatedAt}`)
        //       .style("left", (d3.event.pageX) + "px")
        //       .style("top", (d3.event.pageY - 28) + "px");
        //   })
        // .on("mouseout", function(d) {
        //   divCircle.style("opacity", 0);
        // })
        //
        .on("contextmenu", this.contextMenu("client", this.menuClient));
      var circleReceiver = svg
        .select("#circleReceiver")
        .selectAll("circle")
        .data(this.$data.force.nodes().filter(data => data.role == "Receiver"))
        .enter()
        .append("svg:circle")
        .attr("class", "receiver")
        .attr("class", "node")
        .attr("r", 6)
        .attr("timestamp", function(d) {
          return d.createdAt;
        })
        .on("dblclick", dblclick)
        .call(this.$data.force.drag)
        // .on("mouseover", function(d) {
        //   divCircle.
        //       style("opacity", .8);
        //       divCircle.html(`Owner: ${d.owner}<br/>
        //       ${d.documentType}: ${d.documentName}<br/>
        //       Created at: ${d.createdAt}<br/>
        //       Updated at: ${d.updatedAt}`)
        //       .style("left", (d3.event.pageX) + "px")
        //       .style("top", (d3.event.pageY - 28) + "px");
        //   })
        // .on("mouseout", function(d) {
        //   divCircle.style("opacity", 0);
        // })
        //
        .on("contextmenu", this.contextMenu("client", this.menuClient));
      const rectWidth = 24;
      const rectHeight = 24;
      var rect = svg
        .select("#rectStream")
        .selectAll("rect")
        .data(this.$data.force.nodes().filter(d => d.type == "Stream"))
        .enter()
        .append("svg:rect")
        .attr("class", "node")
        .attr("x", -rectWidth / 2)
        .attr("y", -rectHeight / 2)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("timestamp", function(d) {
          return d.createdAt;
        })
        .on("dblclick", dblclick)
        .call(this.$data.force.drag)
        .on("contextmenu", this.contextMenu("stream", this.menuStream));
      //text content.
      var text = svg
        .select("#text")
        .selectAll("g")
        .data(this.$data.force.nodes())
        .enter()
        .append("svg:g")
        .attr("timestamp", function(d) {
          return d.createdAt;
        });
      text
        .append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")
        .attr("class", "shadow")

        .text(function(d) {
          return d.name;
        });
      text
        .append("svg:text")
        .attr("x", 8)
        .attr("y", ".31em")

        .text(function(d) {
          return d.name;
        });

      function dblclick(d) {
        d3.select(this).classed("fixed", (d.fixed = !d.fixed));
      }
      function dragstart(d) {
        if (this.toggleDrag) {
          d3.select(this).classed("fixed", (d.fixed = true));
        } else {
          d3.select(this).classed("fixed", (d.fixed = false));
        }
      }

      var parentContext = this;
      function tick() {
        svg
          .selectAll(".node")

          .attr("fill", data => parentContext.colour(data.index))
          .attr("cx", function(d) {
            return (d.x = Math.max(
              30,
              Math.min(parentContext.svgWidth - 30, d.x)
            ));
          })
          .attr("cy", function(d) {
            return (d.y = Math.max(
              30,
              Math.min(parentContext.svgHeight - 30, d.y)
            ));
          });
        svg
          .select("#hullOwner")
          .selectAll(".subhullOwner")
          .data(groupOwners)
          .attr("d", groupPath)
          .enter()
          .insert("path")
          .attr("d", groupPath);
        svg
          .select("#hullDoc")
          .selectAll(".subhullDoc")
          .data(groupDocs)
          .attr("d", groupPath)
          .enter()
          .insert("path")
          .attr("d", groupPath);
        path
          .attr("d", function(d) {
            var dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy);

            if (!parentContext.linearcs) {
              return (
                "M" +
                d.source.x +
                "," +
                d.source.y +
                "A" +
                dr +
                "," +
                dr +
                " 0 0,1 " +
                d.target.x +
                "," +
                d.target.y
              );
            } else if (parentContext.linearcs) {
              return (
                "M" +
                d.source.x +
                "," +
                d.source.y +
                "L" +
                d.target.x +
                "," +
                d.target.y
              );
            }
          })
          .attr("stroke", data => parentContext.colour(data.source.index));
        //
        // svg.selectAll('marker')
        // .attr('fill', data =>
        //   colour(data.target.index)
        // );
        // circleSender.attr("transform", function(d) {
        //   return "translate(" + d.x + "," + d.y + ")";
        // })
        // ;
        // circleReceiver.attr("transform", function(d) {
        //   return "translate(" + d.x + "," + d.y + ")";
        // });
        rect.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
        text.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      }

      this.drawGraph.tick = tick; // create a reference to the inner function

      this.updateDisplayNodes("#circleSender");
      this.updateDisplayNodes("#circleReceiver");
      this.updateDisplayNodes("#rectStream");
      this.updateDisplayNodes("#text");
      this.updateDisplayLinks("#pathLink");
    }
  },
  mounted() {
    this.svgWidth = document.getElementById("clientGraph").offsetWidth
    this.drawGraph();
  

  },

  computed: {}
};
</script>

<style>
.bar-positive {
  fill: steelblue;
  transition: r 0.2s ease-in-out;
}

.svg-container {
  display: inline-block;
  position: relative;
  width: 100%;
  padding-bottom: 1%;
  vertical-align: top;
  overflow: hidden;
}

rect {
  cursor: pointer;
  stroke: lightgray;
  stroke-width: 2px;
}

circle {
  cursor: pointer;
  stroke: lightgray;
  stroke-width: 2px;
}

text {
  font: 15px arial;
  pointer-events: none;
  opacity: 0.7;
}

text.shadow {
  stroke: #fff;
  stroke-width: 3px;
  stroke-opacity: 0.8;
}

.d3-context-menu {
  position: absolute;
  display: none;
  background-color: rgb(240, 240, 240);
  border-radius: 8px;
  box-shadow: rgb(73, 73, 73) 3px 3px 7px;
  font-family: Arial, sans-serif;
  font-size: 10px;
  min-width: 150px;
  border: 0px solid #d4d4d4;
  border: 0px solid #ffffff00;
  z-index: 1200;
  padding-top: 3px;
  padding-bottom: 3px;
}

.d3-context-menu ul {
  list-style-type: none;
  margin: 4px 0px;
  padding: 0px;
  cursor: pointer;
}

.d3-context-menu ul li {
  padding: 4px 16px;
}

.d3-context-menu ul li.stream:hover {
  background-color: hotpink;
  color: #fefefe;
  transition: 700ms;
}

.d3-context-menu ul li.client:hover {
  background-color: #0099ff;
  color: #fefefe;
  transition: 700ms;
}

.tooltip {
  position: absolute;
  text-align: center;
  width: 250px;
  height: 60px;
  padding: 2px;
  font: 12px sans-serif;
  background: #94e1ff;
  border: 2px;
  border-color: black;
  border-width: 2px;
  border-radius: 8px;
  pointer-events: none;
}

.tooltipOwner {
  position: absolute;
  text-align: center;
  width: 250px;
  height: 15px;
  padding: 2px;
  font: 12px sans-serif;
  background: #50ccfd;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}

.tooltipDoc {
  position: absolute;
  text-align: center;
  width: 350px;
  height: 45px;
  padding: 2px;
  font: 12px sans-serif;
  background: hotpink;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}

.hull {
  fill: steelblue;
  fill-opacity: 1;
  stroke: steelblue;
  stroke-width: 22px;
  stroke-opacity: 1;
  stroke-linejoin: round;
}

.subhullOwner {
  fill: rgb(126, 191, 243);
  stroke: rgb(126, 191, 243);

  stroke-width: 20;
  opacity: 0.2;
  stroke-linejoin: round;
}

.subhullDoc {
  fill: hotpink;
  stroke: hotpink;

  stroke-width: 20;
  opacity: 0.2;
  stroke-linejoin: round;
}

path.link {
  fill: none;
  stroke-width: 1.5px;
}

</style>
