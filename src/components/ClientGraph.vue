<template>
  <v-card class="elevation-0">
    <v-toolbar class="elevation-0 transparent">
      <v-icon left small>share</v-icon>
      <span class="title font-weight-light">Project's Graph</span>
      <v-spacer></v-spacer>
      <span right></span>
    </v-toolbar>
    <v-divider></v-divider>
    <v-container fluid>
      <v-layout>
        <!-- https://vuetifyjs.com/en/components/button-groups -->
        <v-toolbar>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon @click="refresh()" v-on="on">
                <v-icon>refresh</v-icon>
              </v-btn>
            </template>
            <span>Refresh</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon @click="saveAsPNG()" v-on="on">
                <v-icon>save_alt</v-icon>
              </v-btn>
            </template>
            <span>Save as PNG</span>
          </v-tooltip>

          <v-divider class="mr-3" vertical></v-divider>

          <v-btn-toggle v-model="toggle_multiple" class="transparent" multiple>
            <v-btn color="pink lighten-2" :value="1" flat>Documents</v-btn>
            <v-btn color="blue lighten-2" :value="2" flat>Users</v-btn>
          </v-btn-toggle>

          <v-divider class="ml-3" vertical></v-divider>

          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon @click="toggleDrag = !toggleDrag" v-model="toggleDrag">
                <v-icon v-if="toggleDrag">gps_fixed</v-icon>
                <v-icon v-if="!toggleDrag">gps_not_fixed</v-icon>
              </v-btn>
            </template>
            <span>Enable drag</span>
          </v-tooltip>
        </v-toolbar>

        <!-- <v-flex xs12>This graph represents the data flow between the project's users and clients.</v-flex> -->
      </v-layout>
      <v-divider class="ml-2" vertical></v-divider>
      <v-layout>
        <v-flex xs6>
          <!-- <v-subheader class="pl-0">Custom thumb size</v-subheader> -->
          <v-slider
            v-model="documentLinksForce"
            always-dirty
            :thumb-size="24"
            color="pink lighten-2"
            thumb-label="always"
            append-icon="zoom_out_map"
            prepend-icon="group_work"
            @click:append="expandDocuments"
            @click:prepend="collapseDocuments"
            :max="300"
            :min="0"
          ></v-slider>
        </v-flex>

        <v-flex>
          <v-switch class="custom-switch" v-model="switchForce" color="blue lighten-2"></v-switch>
        </v-flex>

        <v-flex xs6>
          <!-- <v-subheader class="pl-0">Custom thumb size</v-subheader> -->
          <v-slider
            v-model="userLinksForce"
            always-dirty
            :thumb-size="24"
            color="blue lighten-2"
            thumb-label="always"
            append-icon="zoom_out_map"
            prepend-icon="group_work"
            @click:append="expandUsers"
            @click:prepend="collapseUsers"
            :max="300"
            :min="0"
          ></v-slider>
        </v-flex>
      </v-layout>

            <v-flex xs12 class="pa-5">
        <vue-slider
          ref="timeSlider"
          :data="dates"
          v-model="sliderValue"
          piecewise
          process-dragable
          :piecewise-label="dates.length < 5 ? true : false"
          xxxwidth="100%"
          xxxstyle="margin-left:10%;"
          :tooltipStyle="{ 'font-size':'11px' }"
          v-if="dates.length>0"
        ></vue-slider>
      </v-flex>
    </v-container>
 



    <v-divider></v-divider>
    <div id="appClientGraph">
      <svg v-if="!redrawToggle || !result" width="100%" :height="svgHeight" />
      <ForceDirectedLayout
        v-if="result && redrawToggle"
        :svgHeight="svgHeight"
        :showDocGroups="toggle_multiple"
        :clientdata="result"
        :clientdatafilter="filteredResult"
        :timeFilter="filteredTime"
        :dateFilter="dateMinMax"
        :toggleDrag="toggleDrag"
        :userLinksForce="userLinksForce"
        :documentLinksForce="documentLinksForce"
        :switchForce="switchForce"
      />
    </div>
  </v-card>
</template>

<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>


<script>
import ForceDirectedLayout from "./ForceDirectedLayout.vue";
import VueSlider from "vue-slider-component";
import axios from "axios";
import Vue from "vue";
import AsyncComputed from "vue-async-computed";
import svgtopng from "save-svg-as-png";

Vue.use(AsyncComputed);
export default {
  name: "ClientGraph",
  components: {
    ForceDirectedLayout,
    VueSlider
  },
  props: {
    project: Object
  },
  // watch:{
  //   switchForce: function(){
  //     console.log('lol')
  //     //toggle_multiple: [1, 2],
  //   }
  // },
  data: () => ({
    switchForce: false,
    documentLinksForce: 0,
    userLinksForce: 0,
    toggleDrag: false,
    dates: [],
    sliderValue: [],
    lowerIndex: 0,
    upperIndex: 0,
    
    showDocGroups: true,
    redrawToggle: true,
    result: null,

    sortedNodesByCreationDate: null,
    svgHeight: 600,
    filteredResult: null,
    filteredTime: null,
    dateMinMax: []
  }),
  computed: {

        toggle_multiple: function(){
        if(this.switchForce){
          return [2]
        }
        if(!this.switchForce){
          return [1]

        }else{
          return [1,2]
        }
        }
  },
  watch: {
    sliderValue: function() {
      //console.log(this.sliderValue.map( d => ( new Date( d ) ).toISOString()))

      this.filteredTime = this.sliderValue.map(d => new Date(d).toISOString());
    },

    
  },

  methods: {
    collapseUsers() {
      this.userLinksForce = this.userLinksForce - 10;
    },
    expandUsers() {
      this.userLinksForce = this.userLinksForce + 10;
    },

    collapseDocuments() {
      this.documentLinksForce = this.documentLinksForce - 10;
    },
    expandDocuments() {
      this.documentLinksForce = this.documentLinksForce + 10;
    },
    getMin() {
      let createdAts = this.sortedNodesByCreationDate.map(d => d.createdAt);
      return createdAts[this.value3[0]];
    },
    getMax() {
      let createdAts = this.sortedNodesByCreationDate.map(d => d.createdAt);
      return createdAts[this.value3[1]];
    },
    mounted() {},
    saveAsPNG() {
      svgtopng.saveSvgAsPng(
        document.getElementById("graphLayout"),
        "diagram.png",
        { scale: 3 }
      );
    },
    refresh() {
      this.$asyncComputed.myResolvedValue.update();
      this.$data.redrawToggle = false;
      setTimeout(() => {
        this.$data.redrawToggle = true;
      }, 500);
    },
    AddResizeListener() {
      //redraw the chart 300ms after the window has been resized
      window.addEventListener("resize", () => {
        this.$data.redrawToggle = false;
        setTimeout(() => {
          this.$data.redrawToggle = true;
        }, 1500);
      });
    }
  },
  updated() {
    this.AddResizeListener();
      console.log('lol')
      // if(this.switchForce){
      //   this.toggle_multiple = [1]
      //   break
      // }else{
      //   this.toggle_multiple = [2]
      //   break
      // }
  //     //toggle_multiple: [1, 2],
  },
  asyncComputed: {
    async myResolvedValue() {
      this.toggleDrag = false;
      var streamLinks = [];
      var nodes = [];

      let resProject;
      try {
        resProject = await axios.get(
          `https://hestia.speckle.works/api/projects/${this.project._id}`
        );
      } catch (err) {
        console.log(err);
        return;
      }

      var projectStreams = resProject.data.resource.streams;

      for (var i = 0; i < projectStreams.length; i++) {
        var streamShortID = projectStreams[i];
        let stream_id;

        let resStream;

        try {
          resStream = await axios.get(
            `https://hestia.speckle.works/api/streams/${streamShortID}`
          );

          stream_id = resStream.data.resource._id;
          let streamOwnerID = resStream.data.resource.owner;
          let streamCreatedAt = resStream.data.resource.createdAt;
          let streamUpdatedAt = resStream.data.resource.updatedAt;
          let streamName = resStream.data.resource.name;

          nodes.push({
            type: "Stream",
            _id: stream_id,
            streamId: streamShortID,
            owner: streamOwnerID,
            createdAt: streamCreatedAt,
            updatedAt: streamUpdatedAt,
            size: "10",
            name: streamName
          });
        } catch (error) {
          console.log("Can't access stream: " + streamShortID);
        }

        //
        let resClient;
        try {
          resClient = await axios.get(
            `https://hestia.speckle.works/api/streams/${streamShortID}/clients`
          );

          for (var j = 0; j < resClient.data.resources.length; j++) {
            let client_id = resClient.data.resources[j]._id;
            let clientOwnerID = resClient.data.resources[j].owner;
            let clientCreatedAt = resClient.data.resources[j].createdAt;
            let clientUpdatedAt = resClient.data.resources[j].updatedAt;
            let clientRole = resClient.data.resources[j].role;
            let clientDocumentType = resClient.data.resources[j].documentType;
            let clientDocumentName = resClient.data.resources[j].documentName;
            let clientDocumentID = resClient.data.resources[j].documentGuid;

            nodes.push({
              type: "Client",
              _id: client_id,
              owner: clientOwnerID,
              createdAt: clientCreatedAt,
              updatedAt: clientUpdatedAt,
              role: clientRole,
              size: "10",
              documentType: clientDocumentType,
              documentName: clientDocumentName,
              documentGuid: clientDocumentID,
              name: `${clientRole.charAt(0)}`
            });

            if (clientRole == "Receiver") {
              streamLinks.push({
                source: stream_id,
                target: client_id,
                action: "receiving"
              });
            } else if (clientRole == "Sender") {
              streamLinks.push({
                source: client_id,
                target: stream_id,
                action: "sending"
              });
            }
          }
        } catch (error) {
          console.log("Can't access stream's client from " + streamShortID);
        }
      }
      console.log(nodes);

      this.sortedNodesByCreationDate = nodes;
      this.sortedNodesByCreationDate.sort(function(a, b) {
        return a.createdAt < b.createdAt
          ? -1
          : a.createdAt > b.createdAt
          ? 1
          : 0;
      });

      let createdAts = this.sortedNodesByCreationDate.map(d => d.createdAt);

      this.result = [nodes, streamLinks];
      //this.value3 = [0,this.result[0].length-1]
      this.dates = createdAts;
      //console.log(createdAts.map( d => ( new Date( d ) ).toLocaleString( 'en', { minimumFractionDigits: 10 } ) ))
      //this.dates = createdAts;
      this.sliderValue = [this.dates[0], this.dates[this.dates.length - 1]];

      return [nodes, streamLinks];
    }
  }
};
</script>

<style lang='scss'>
#appClientGraph {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 30px;
}
.vue-slider-piecewise {
  z-index: 100 !important;
  pointer-events: none;
}

.vue-slider-piecewise-item {
  z-index: 100 !important;
}

.custom-switch .v-input--selection-controls__input div {
  color: #f06292;
}
</style>
