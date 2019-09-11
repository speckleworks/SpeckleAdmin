<template>
  <div id="clientGraph">
    <svg width="100%" :height="svgHeight" id="graphLayout"> 
        <g class="everything">  
          <g v-show="showDocGroups.includes(1)" id="hullDoc" />
          <g v-show="showDocGroups.includes(2)" id="hullOwner" />
          <g id="pathLink"/>
          <g id="marker"/>
          <g id="circleSender"/>
          <g id="circleReceiver"/>
          <g id="rectStream"/>
          <g id="text"/>
        </g>
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
    brush: Boolean,
    documentLinksForce: Number,
    switchForce: Boolean,
    linearcs: Boolean,
    inspectTimeframe: Boolean,
    inspectSelectedTags: Boolean,
    streamTags: Array,
    refocus: Boolean
    
  },

  watch: {

    refocus: function(){
      var container = d3.select(".everything")
      var zoom = d3.zoom().
          scaleExtent([0, 0]).
          on("zoom", () => {       
              container.attr("transform", d3.event.transform)                
          })
      d3.select("#graphLayout").call(zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1))
    },
    inspectSelectedTags: function(){
      var taggedStreams = []
      Array.from(document.querySelector("#rectStream").children)
      .forEach(function(d) {
          if(d.classList.contains("tagSelected")){
            taggedStreams.push(d3.select(d).datum().streamId)
          }else{
          }
      })
      var url = "https://hestia.speckle.works/#/view/" + taggedStreams.join(',');
      window.open(url, "_blank").focus();
    },
    streamTags: function(){
      var context = this
      Array.from(document.querySelector("#rectStream").children)
      .forEach(function(d) {
        var myStreamTags = Array.from(d3.select(d).datum().tags)
        var selected = context.findCommonElement(myStreamTags, context.streamTags)
        if(selected){
              d.classList.remove("tagSelected")
              //context.selectedTaggedStreams.splice( context.selectedTaggedStreams.indexOf(d3.select(d).datum().streamId), 1 )
              if(context.selectedTaggedStreams.indexOf(d3.select(d).datum().streamId) != -1){
              context.selectedTaggedStreams.splice( context.selectedTaggedStreams.indexOf(d3.select(d).datum().streamId), 1 )
              }
              d.classList.add("tagSelected")
              context.selectedTaggedStreams.push(d3.select(d).datum().streamId)
            }else{
              d.classList.remove("tagSelected")
              if(context.selectedTaggedStreams.indexOf(d3.select(d).datum().streamId) != -1){
              context.selectedTaggedStreams.splice( context.selectedTaggedStreams.indexOf(d3.select(d).datum().streamId), 1 )
              }
            }
      })
      context.$emit('triggeredTags', context.selectedTaggedStreams)
    },
    inspectTimeframe: function(){
      var selectedStreams = []
      Array.from(document.querySelector("#rectStream").children)
      .forEach(function(d) {
        if(d.classList.contains("selected")){
          selectedStreams.push(d3.select(d).datum().streamId)
        }
      })
      
      var url = "https://hestia.speckle.works/#/view/" + selectedStreams.join(',');
          window.open(url, "_blank").focus();
    },
    brush: function(){
      console.log(this.brush)
    },
    linearcs: function() {
      this.drawGraph.tick();
    },
    switchForce: function() {
      if (this.switchForce) {
        this.$data.simulation.force("link").links(this.forceLinks.filter(d => d.type != "documentGuidForceGroup"))
        this.$data.simulation.alpha(1).restart();
      } else {
        this.$data.simulation.force("link").links(this.forceLinks.filter(d => d.type != "ownerForceGroup"))
        this.$data.simulation.alpha(1).restart();
      }
    },

    documentLinksForce: function() {
      this.$data.simulation.force("link").distance(d => {
          if (d.type == "ownerForceGroup") {
            return this.documentLinksForce;
          } else if (d.type == "documentGuidForceGroup") {
            return this.documentLinksForce;
          } else {
            return 116;
          }
        })
      this.$data.simulation.alpha(1).restart();
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
    filteredNodes: null,
    colour: null,
    groupPath: null,
    simulation: null,
    selectedTaggedStreams: [],

    svgWidth: document.getElementById("appClientGraph").offsetWidth,
    menuStream: [
      {
        title: "View Stream in Viewer",
        action: function(d, i) {
          var data = d3.select(d).datum();
          console.log(data);
          var url = "https://hestia.speckle.works/#/view/" + data.streamId;
          window.open(url, "_blank").focus();
        },
        disabled: false // optional, defaults to false
      },
      {
        title: "View Stream in Admin",
        action: function(d, i) {
          var data = d3.select(d).datum();
          console.log(data);
          var url = "https://hestia.speckle.works/#/streams/" + data.streamId;
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
    ],
    hullPadding: 60,
    pointRadius: 20,
    roundedHull: function (polyPoints) {
      // Returns the SVG path data string representing the polygon, expanded and rounded.

      // Handle special cases
      if (!polyPoints || polyPoints.length < 1) return "";
      if (polyPoints.length === 1) return roundedHull1 (polyPoints);
      if (polyPoints.length === 2) return roundedHull2 (polyPoints);

      var segments = new Array (polyPoints.length);

      // Calculate each offset (outwards) segment of the convex hull.
      for (var segmentIndex = 0;  segmentIndex < segments.length;  ++segmentIndex) {
          var p0 = (segmentIndex === 0) ? polyPoints[polyPoints.length-1] : polyPoints[segmentIndex-1];
          var p1 = polyPoints[segmentIndex];

          // Compute the offset vector for the line segment, with length = hullPadding.
          var offset = vecScale (hullPadding, unitNormal (p0, p1));

          segments[segmentIndex] = [ vecSum (p0, offset), vecSum (p1, offset) ];
      }

      var arcData = 'A ' + [hullPadding, hullPadding, '0,0,0,'].join(',');

      segments = segments.map (function (segment, index) {
          var pathFragment = "";
          if (index === 0) {
              var pathFragment = 'M ' + segments[segments.length-1][1] + ' ';
          }
          pathFragment += arcData + segment[0] + ' L ' + segment[1];

          return pathFragment;
      });

      return segments.join(' ');
  },
  roundedHull1: function (polyPoints) {
      // Returns the path for a rounded hull around a single point (a circle).

      var p1 = [polyPoints[0][0], polyPoints[0][1] - hullPadding];
      var p2 = [polyPoints[0][0], polyPoints[0][1] + hullPadding];

      return 'M ' + p1
          + ' A ' + [hullPadding, hullPadding, '0,0,0', p2].join(',')
          + ' A ' + [hullPadding, hullPadding, '0,0,0', p1].join(',');
  },
  roundedHull2: function (polyPoints) {
      // Returns the path for a rounded hull around two points (a "capsule" shape).

      var offsetVector = vecScale (hullPadding, unitNormal (polyPoints[0], polyPoints[1]));
      var invOffsetVector = vecScale (-1, offsetVector);

      var p0 = vecSum (polyPoints[0], offsetVector);
      var p1 = vecSum (polyPoints[1], offsetVector);
      var p2 = vecSum (polyPoints[1], invOffsetVector);
      var p3 = vecSum (polyPoints[0], invOffsetVector);

      return 'M ' + p0
          + ' L ' + p1 + ' A ' + [hullPadding, hullPadding, '0,0,0', p2].join(',')
          + ' L ' + p3 + ' A ' + [hullPadding, hullPadding, '0,0,0', p0].join(',');
  },
  vecScale: function (scale, v) {
    // Returns the vector 'v' scaled by 'scale'.
    return [ scale * v[0], scale * v[1] ];
  },
  vecSum: function (pv1, pv2) {
    // Returns the sum of two vectors, or a combination of a point and a vector.
    return [ pv1[0] + pv2[0], pv1[1] + pv2[1] ];
  },
  unitNormal: function (p0, p1) {
    // Returns the unit normal to the line segment from p0 to p1.
    var n = [ p0[1] - p1[1], p1[0] - p0[0] ];
    var nLength = Math.sqrt (n[0]*n[0] + n[1]*n[1]);
    return [ n[0] / nLength, n[1] / nLength ];
  }

  }),

  methods: {
    
    zoom_actions(){
      d3.select(".everything").attr("transform", d3.event.transform)
    },

    findCommonElement(array1, array2) { 
          
        // Loop for array1 
        for(let i = 0; i < array1.length; i++) { 
              
            // Loop for array2 
            for(let j = 0; j < array2.length; j++) { 
                  
                // Compare the element of each and 
                // every element from both of the 
                // arrays 
                if(array1[i] === array2[j]) { 
                  
                    // Return if common element found 
                    return true; 
                } 
            } 
        } 
          
        // Return if no common element exist 
        return false;  
    },
    // Drag events for the whole d3 force simulation
    drag() {
      var parentContext = this
      function dragstarted(d) {
          if (!d3.event.active) parentContext.simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
      }
      
      function dragged(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
      }
      
      function dragended(d) {
          if (!d3.event.active) parentContext.simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
      }
      
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    },



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
          node.style.transition = "visibility 0s, opacity 0.4s linear";
        } else {
          node.style.opacity = 0.2;
          node.style.transition = "visibility 0s, opacity 0.4s linear";
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
          node.classList.remove("unselected")
          node.classList.add("selected")
          node.style.transition = "visibility 0s, opacity 0.4s linear";
          
          node.style.opacity = 1;
        } else {
          //node.style.display = "none"
          node.classList.remove("selected")
          node.classList.add("unselected")
          node.style.opacity = 0.2;
          node.style.transition = "visibility 0s, opacity 0.4s linear";
        }
      });

      var selectedStreams = []
      Array.from(document.querySelector("#rectStream").children)
      .forEach(function(d) {
        if(d.classList.contains("selected")){
          selectedStreams.push(d3.select(d).datum().streamId)
        }
      })
      context.$emit('triggeredTimeFrame', selectedStreams)
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


    // d3.select("#graphLayout")
    //   .call( d3.brush()                     // Add the brush feature using the d3.brush function
    //     .extent( [ [0,0], [this.$data.svgWidth,this.$props.svgHeight] ] )       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    //   )
    
      var svg = d3
        .select("#graphLayout")

      // var brush = svg.append("g")
      //   .attr("class", "brush");

      // if(this.$props.brush){
      // brush.call(d3.brush()
      //       .extent([[0, 0], [this.$data.svgWidth, this.$props.svgHeight]])
      //       .on("start", brushstarted)
      //       .on("brush", brushed)
      //       .on("end", brushended));
      // }

      this.$data.simulation = d3.forceSimulation()
        .nodes(d3.values(_nodes))
        .force("forceY", d3.forceY(0).strength(0.08))
        .force("link", d3.forceLink(thisContext.forceLinks).distance(d => {
          if (d.type == "ownerForceGroup") {
            return this.documentLinksForce;
          } else if (d.type == "documentGuidForceGroup") {
            return this.documentLinksForce; 
          } else {
            return 100;
          }
        }
        ))
        .force("center", d3.forceCenter(this.$data.svgWidth / 2, this.$props.svgHeight / 2))
        .force("charge", d3.forceManyBody().strength(function (d) {
          if (d.type == "ownerForceGroup") {
            return 200;
          } else if (d.type == "documentGuidForceGroup") {
            return 200;
          } else {
            return -200;
          }
        }))
        .on("tick", tick);

      //add zoom capabilities 
      var zoom_handler = d3.zoom()
          .on("zoom", this.zoom_actions);

      zoom_handler(svg);

      this.$data.simulation.nodes().forEach(function(d) {
        d.selected = false;
        d.previouslySelected = false;
      })

      if (this.switchForce) {
        // docs
        var filterLinks = this.forceLinks.filter(
          d => d.type != "documentGuidForceGroup"
        );
        this.$data.simulation.force("link").links(filterLinks)
        this.$data.simulation.alpha(1).restart();
      } else {
        var filterLinks = this.forceLinks.filter(
          d => d.type != "ownerForceGroup"
        );
        this.$data.simulation.force("link").links(filterLinks)
        this.$data.simulation.alpha(1).restart();
      }

      this.$data.colour = d3.scaleLinear()
        .domain([0, _nodes.length - 1])
        .interpolate(d3.interpolateHcl)
        .range([d3.rgb("lightgray"), d3.rgb("blue")]);

      var xScale = d3.scaleLinear()
        .domain([0, this.svgWidth])
        .range([0, this.svgWidth]);
      var yScale = d3.scaleLinear()
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




      // svg
      //   .select("#hullDoc")
      //   .selectAll("path")
      //   .data(Object.keys(childGroups))
      //   .enter()
      //   .append("path")
      //   .attr("class", "subhullDoc")
      //   .on("mouseover", function(d) {
      //     divDoc.style("opacity", 0.8);
      //     divDoc
      //       .html(
      //         `DocumentGuid: ${d.values[0].documentGuid}<br/>
      //       DocumentType: ${d.values[0].documentType}<br/>
      //       DocumentName: ${d.values[0].documentName}`
      //       )
      //       .style("left", d3.event.pageX + "px")
      //       .style("top", d3.event.pageY - 28 + "px");
      //   })
      //   .on("mouseout", function(d) {
      //     divDoc.style("opacity", 0);
      //   });

      var groupOwners = d3
        .nest()
        .key(function(d) {
          return d.owner;
        })
        .entries(
          this.$data.simulation.nodes().filter(data => data.type == "Client")
        );

      var groupDocs = d3
        .nest()
        .key(function(d) {
          return d.documentGuid;
        })
        .entries(
          this.$data.simulation.nodes().filter(data => data.type == "Client")
        );

      // var groupPath = function(d) {
      //   return (
      //     "M" +
      //     d3.polygonHull(
      //         d.values.map(function(i) {
      //           return [i.x, i.y];
      //         })
      //       )
      //       .join("L") +
      //     "Z"
      //   );
      // };

      //
      svg
        .select("#marker")
        .selectAll("marker")
        .data(this.$data.simulation.force("link").links().filter(data => data.display))
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
        .attr("markerWidth", 20)
        .attr("markerHeight", 12)
        .attr("orient", "auto")
        .attr("fill-opacity", 1)
        
        //.attr("fill", data => this.colour(data.target.index))
        .attr("markerUnits", "userSpaceOnUse")
        .attr("stroke-linecap", "round")
        // .append("svg:path")
        // .attr("d", "M0,-5L10,0L0,5");
      var path = svg
        .select("#pathLink")
        .selectAll("path")
        .data(this.$data.simulation.force("link").links().filter(data => data.display))
        .enter()
        .append("svg:path")
        .attr("stroke-width", 1.5)
        .attr("stroke-width", data => {
          if(data.source.type === "Stream"){
            if(data.source.objectsNumber > 15){
              return 8
            }
            else if(data.source.objectsNumber < 2){
              return 3
            }
            else{
              return data.source.objectsNumber
            }
          }
          if(data.target.type === "Stream"){
            if(data.target.objectsNumber > 15){
              return 8
            }
            else if(data.target.objectsNumber < 2){
              return 3
            }
            else{
              return data.target.objectsNumber
            }
          }
        })
        .attr("stroke-linecap", "round")
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
        .data(this.$data.simulation.nodes().filter(data => data.role == "Sender"))
        .enter()
        .append("svg:circle")
        .attr("class", "sender")
        .attr("class", "node")
        .attr("r", 6)
        .attr("timestamp", function(d) {
          return d.createdAt;
        })
        .on("dblclick", dblclick)
        .call(this.drag(this.$data.simulation))
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
        .data(this.$data.simulation.nodes().filter(data => data.role == "Receiver"))
        .enter()
        .append("svg:circle")
        .attr("class", "receiver")
        .attr("class", "node")
        .attr("r", 6)
        .attr("timestamp", function(d) {
          return d.createdAt;
        })
        .on("dblclick", dblclick)
        .call(this.drag(this.$data.simulation))
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
        .data(this.$data.simulation.nodes().filter(d => d.type == "Stream"))
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
        .call(this.drag(this.$data.simulation))
        .on("contextmenu", this.contextMenu("stream", this.menuStream));
      //text content.
      var text = svg
        .select("#text")
        .selectAll("g")
        .data(this.$data.simulation.nodes())
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

      var parentContext = this
      function brushstarted() {
        if (d3.event.sourceEvent.type !== "end") {
          svg
        .select("#rectStream")
        .selectAll("rect").classed("selected", function(d) {
            return d.selected = d.previouslySelected = parentContext.$data.shiftKey && d.selected;
          });
        }
      }

      function brushed() {
        if (d3.event.sourceEvent.type !== "end") {
          var selection = d3.event.selection;
          svg
        .select("#rectStream")
        .selectAll("rect").classed("selected", function(d) {
            return d.selected = d.previouslySelected ^
                (selection != null
                && selection[0][0] <= d.x && d.x < selection[1][0]
                && selection[0][1] <= d.y && d.y < selection[1][1]);
          });
        }
      }

      function brushended() {
        if (d3.event.selection != null) {
          d3.select(this).call(d3.event.target.move, null);
        }
      }



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
            return d.x
            // return (d.x = Math.max(
            //   30,
            //   Math.min(parentContext.svgWidth - 30, d.x)
            // ));
          })
          .attr("cy", function(d) {
            return d.y
            // return (d.y = Math.max(
            //   30,
            //   Math.min(parentContext.svgHeight - 30, d.y)
            // ));
          });
        // svg
        //   .select("#hullOwner")
        //   .selectAll(".subhullOwner")
        //   .data(groupOwners)
        //   .attr("d", groupPath)
        //   .enter()
        //   .insert("path")
        //   .attr("d", groupPath);
        // svg
        //   .select("#hullDoc")
        //   .selectAll(".subhullDoc")
        //   .data(groupDocs)
        //   .attr("d", groupPath)
        //   .enter()
        //   .insert("path")
        //   .attr("d", groupPath);
        path
          .attr("d", function(d) {
            var dx = d.target.x - d.source.x,
              dy = d.target.y - d.source.y,
              dr = Math.sqrt(dx * dx + dy * dy);
              var x0 = d.source.x;
              var y0 = d.source.y;
              var x1 = d.target.x;
              var y1 = d.target.y;
              var xcontrol = x1 * 0.5 + x0 * 0.5;
            if (!parentContext.linearcs) {
              // return (
              //   "M" +
              //   d.source.x +
              //   "," +
              //   d.source.y +
              //   "A" +
              //   dr +
              //   "," +
              //   dr +
              //   " 0 0,1 " +
              //   d.target.x +
              //   "," +
              //   d.target.y
              // );
              return ["M",x0,y0,"C",xcontrol,y0,xcontrol,y1,x1,y1].join(" ");
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
      window.addEventListener("keypress", function(e) {
      console.log(String.fromCharCode(e.keyCode));
    });

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

#graphLayout {
  cursor: all-scroll
}

rect {
  cursor: pointer;
  stroke: lightgray;
  stroke-width: 2px;
}

.tagSelected {
  stroke: rgba(0, 255, 200, 0.4);
  stroke-width: 5px;

  fill:  rgba(0, 255, 200, 0.4)
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
  
}


marker {
  stroke-width: 1000 !important
}
.brush {
  stroke: #222;
  fill-opacity: .125;
  shape-rendering: crispEdges;
}
</style>
