<template>
  <div id="container" class="svg-container" align="center">
    <h2>client graph</h2>
    <svg :width="w" :height="h">
      <g></g>
    </svg>
  </div>
</template>

<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>

<script>
import Vue from "vue";
import * as d3 from "d3";
import AsyncComputed from "vue-async-computed";
Vue.use(AsyncComputed);

export default {
  name: "BarChart",
  props: {
    clientdata: Array
  },

  mounted() {},
  updated() {},
  data: () => ({
    w: 800,
    h: 500,
    menuStream: [
      {
        title: "View Stream",
        action: function(d, i) {
          var data = d3.select(d).datum();
          console.log(data);
          var url = "https://hestia.speckle.works/#/view/" + data.streamId;
          openInNewTab(url);
        },
        disabled: false // optional, defaults to false
      },
      {
        title: "View Stream Data",
        action: function(d, i) {
          var data = d3.select(d).datum();
          var url = "https://hestia.speckle.works/api/streams/" + data.streamId;
          openInNewTab(url);
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
          openInNewTab(url);
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

    // colour: d3.scale.linear()
    //   .domain([0, this.clientdata[0].length-1])
    //   .interpolate(d3.interpolateHcl)
    //   .range([d3.rgb('white'), d3.rgb('blue')])
  }),
  methods: {
    openInNewTab(url) {
      var win = window.open(url, "_blank");
      win.focus();
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
    graph() {
      force: d3.layout
        .force()
        .nodes(d3.values(this.clientdata[0]))
        .links(this.clientdata[1])
        .size([this.w, this.h])
        .linkDistance(d => {
          if (d.type == "ownerForceGroup") {
            return 200;
          } else if (d.type == "documentGuidForceGroup") {
            return 20;
          } else {
            return 116;
          }
        })
        .charge(d => {
          if (d.type == "ownerForceGroup") {
            return -200;
          } else if (d.type == "documentGuidForceGroup") {
            return -1;
          } else {
            return -400;
          }
        })
        //.on("tick", tick)
        .start();
    }
  },

  computed: {},

  asyncComputed: {}
};
</script>

<style scoped>
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
</style>
