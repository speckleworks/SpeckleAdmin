<template>
  <v-card class="elevation-0">


    <template>


        
  <v-expansion-panel focusable>
    <v-expansion-panel-content

    >
      <template v-slot:header>
      
      <span class="title">The <b>Speckle Project's Metagraph&trade;</b><span right class="caption font-weight-light">&nbsp; ...need help? click me for more information! <v-icon>contact_support</v-icon></span></span>
      

      </template>
      <v-card>
        <v-card-text class="caption font-weight-light">Welcome to the <b>Speckle Project's Metagraph&trade;</b> interface!<br />
            The term <i>Metagraph</i> is composed of the prefix "Meta" (from the Greek <b>μετά-</b> meaning "after" or "beyond") and the suffix "Graph" (from the Greek <b>-γραφω</b> meaning "that is written")<br/>
            In other words, this graph has been created to help you get a better understanding of the <b>data flow</b> between the project's users, streams and documents.<br />
            
            <br/>
            <b>1. How to read the graph</b>
            <br/>
            <v-icon>fiber_manual_record</v-icon> Circle nodes represent <b>Senders (S)</b> and <b>Receivers (R)</b>.<br />
            <v-icon>crop_square</v-icon> Square nodes represent <b>Streams</b>.<br />
            <v-icon>compare_arrows</v-icon> Arrows represent either data that has been shared to a stream by a user (<v-icon>fiber_manual_record</v-icon><v-icon>arrow_right_alt</v-icon><v-icon>crop_square</v-icon>) or data that has been retrieved by a user from a stream (<v-icon>crop_square</v-icon><v-icon>arrow_right_alt</v-icon><v-icon>fiber_manual_record</v-icon>).<br />
            <v-icon>color_lens</v-icon> Generally, both nodes and edges are coloured according to their timestamps (dark blue for the newest created, light grey for the oldest).<br/>
            <br/>
            <b>2. What you can do</b><br/>
            <v-icon>gesture</v-icon> You can drag nodes around! 😲 <br/>
            <v-icon>group_work</v-icon> The clients are grouped either by Document GUID or User GUID. You can switch between the two by using the toggle switch situated on the toolbar.<br/>
            <v-icon>360</v-icon> Right clicking on a stream will direct you to its related viewer interface!<br/>
            <v-icon>timeline</v-icon> Use the slider below the toolbar to select and highlight a specific timeframe of your project!<br/>
            <v-icon>refresh</v-icon> If you add streams to your project, you might want to hit the refresh button as the graph <b>won't update automatically</b>.<br/>
            <v-icon>gps_not_fixed</v-icon><v-icon>gps_fixed</v-icon> It is possible to anchor/release the graph by clicking on these icons. Double clicking on specific nodes will perform these same actions locally.<br/>
            <v-icon>trending_flat</v-icon><v-icon>redo</v-icon> The graph's edges can be visualized either by arcs or straight edges.<br/>
            <v-icon>save_alt</v-icon> Finally, you can save your graph as PNG!<br/>
            </v-card-text>
      </v-card>
    </v-expansion-panel-content>
  </v-expansion-panel>

  
</template>

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

        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
            <v-btn icon @click="toggleDrag = !toggleDrag" v-on="on" v-model="toggleDrag">
                <v-icon v-if="toggleDrag">gps_fixed</v-icon>
                <v-icon v-if="!toggleDrag">gps_not_fixed</v-icon>
            </v-btn>
            </template>
            <span>Fix/Release the graph</span>
          </v-tooltip>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
            <v-btn icon @click="linearcs = !linearcs" v-on="on" v-model="linearcs">
                <v-icon v-if="linearcs">trending_flat</v-icon>
                <v-icon v-if="!linearcs">redo</v-icon>
            </v-btn>
            </template>
            <span>Show arcs/edges</span>
          </v-tooltip>



          <!-- <v-btn-toggle v-model="toggle_multiple" class="transparent" multiple>
            <v-btn color="pink lighten-2" :value="1" flat>Documents</v-btn>
            <v-btn color="blue lighten-2" :value="2" flat>Users</v-btn>
          </v-btn-toggle> -->
        
          <v-switch class="custom-switch" v-model="switchForce" :label="`${switchForce ? 'Data flow per users' : 'Data flow per documents'}`" color="blue lighten-2" hide-details></v-switch>
          <div>
            <!-- <v-autocomplete
                label="Search Streams per tag"
                :items="allStreamTags"
                prepend-icon="search"
              ></v-autocomplete> -->

        
          </div>
            

          <v-slider
            v-model="documentLinksForce"
            always-dirty
            :thumb-size="24"
            color="grey darken-1"
            
            append-icon="zoom_out_map"
            prepend-icon="group_work"
            @click:append="expandDocuments"
            @click:prepend="collapseDocuments"
            :max="300"
            :min="-50"
            hide-details label=""
          ></v-slider>
          
        </v-toolbar>

        
      </v-layout>
      <v-divider class="ml-2" vertical></v-divider>

      <br/>
      
      <br/>
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
        
      
      <span class="font-weight-light caption">Drag this slider to select and highlight a specific timeframe from your project!</span>
                <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon @click="inspectTimeframe = !inspectTimeframe" v-on="on">
                <v-icon>360</v-icon>
              </v-btn>
            </template>
            <span>Inspect the timeframe</span>
          </v-tooltip>



            <v-autocomplete
              
              v-model="allStreamTagsJSON_default"
              :items="allStreamTagsJSON"
              filled
              chips
              label="Select streams by tag(s)"
              item-text="name"
              item-value="name"
              multiple
              prepend-icon="search"
              dense
              item-color="black"
              
            >
            <template v-slot:selection="data">
                <v-chip
                  :selected="data.selected"
                  close
                  class="chip--select-multi"
                  @input="remove(data.item)"
                >

                  {{ data.item.name }}
                </v-chip>
              </template>
              <template v-slot:item="data">
                <template v-if="typeof data.item !== 'object'">
                  <v-list-tile-content v-text="data.item.name"></v-list-tile-content>
                </template>
                <template v-else>

                  <v-list-tile-content>
                    <v-list-tile-title v-html="data.item.name"></v-list-tile-title>

                  </v-list-tile-content>
                </template>
              </template>


            <template v-slot:append-outer>
              <v-slide-x-reverse-transition mode="out-in">
                                <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon @click="inspectSelectedTags = !inspectSelectedTags" v-on="on">
                <v-icon>360</v-icon>
              </v-btn>
            </template>
            <span>Inspect the tagged streams</span>
          </v-tooltip>
              </v-slide-x-reverse-transition>
            </template>

            </v-autocomplete>

    </v-container>
 



    
    <div id="appClientGraph">
      <svg v-if="!redrawToggle || !result" width="100%" :height="svgHeight" />
      <ForceDirectedLayout
        v-if="result && redrawToggle"
        :svgHeight="svgHeight"
        :showDocGroups="toggle_multiple"
        :clientdata="result"
        :clientdatafilter="filteredResult"
        :timeFilter="filteredTime"
        :toggleDrag="toggleDrag"
        :documentLinksForce="documentLinksForce"
        :switchForce="switchForce"
        :linearcs="linearcs"
        :brush="brush"
        :inspectTimeframe="inspectTimeframe"
        :inspectSelectedTags="inspectSelectedTags"
        :streamTags="allStreamTagsJSON_default"
      />
    </div>
  </v-card>
</template>




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
  data: () => ({
    friends: null,
    dialog: false,
    brush: true,
    switchForce: false,
    documentLinksForce: -50,
    toggleDrag: false,
    dates: [],
    sliderValue: [],
    linearcs: false,
    showDocGroups: true,
    redrawToggle: true,
    result: null,
    inspectTimeframe: true,
    inspectSelectedTags: true,
    sortedNodesByCreationDate: null,
    svgHeight: 700,
    filteredResult: null,
    filteredTime: null,
    dateMinMax: [],
    allStreamTags: [],
    allStreamTagsJSON: [],
    allStreamTagsJSON_default: [],
    isUpdating: false,
    
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
    },



  },

  watch: {
    sliderValue: function() {
      this.filteredTime = this.sliderValue.map(d => new Date(d).toISOString());
    },
    linearcs: function(){
        //this.refresh()
    },
          isUpdating (val) {
        if (val) {
          setTimeout(() => (this.isUpdating = false), 3000)
        }
          }

  },

  methods: {

    remove (item) {
      const index = this.allStreamTagsJSON_default.indexOf(item.name)
      if (index >= 0) this.allStreamTagsJSON_default.splice(index, 1)
    },

    flatten(arr) {
      var flat = [];
      for (var i = 0; i < arr.length; i++) {
          flat = flat.concat(arr[i]);
      }
      return flat;
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
    mounted() {
      
    },
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
      var alltags = []
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
          let streamTags = resStream.data.resource.tags;
          let objectsNumber = resStream.data.resource.objects.length;
          this.$data.allStreamTags.concat(streamTags)
          for (var j = 0; j < streamTags.length; j++) {
            this.$data.allStreamTagsJSON.push({name: streamTags[j]})
          }
          alltags.push(streamTags)

          nodes.push({
            type: "Stream",
            _id: stream_id,
            streamId: streamShortID,
            owner: streamOwnerID,
            createdAt: streamCreatedAt,
            updatedAt: streamUpdatedAt,
            size: "10",
            objectsNumber: objectsNumber,
            name: streamName,
            tags: streamTags
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
              name: `${clientRole.charAt(0)}` // S or R labels for Senders and Receivers
            });

            if (clientRole == "Receiver") {
              streamLinks.push({
                source: stream_id,
                target: client_id,

                targetClient: client_id,
                targetDoc: clientDocumentID,
                action: "receiving"
              });
            } else if (clientRole == "Sender") {
              streamLinks.push({
                source: client_id,
                target: stream_id,
                
                sourceClient: client_id,
                sourceDoc: clientDocumentID,
                action: "sending"
              });
            }
          }
        } catch (error) {
          console.log("Can't access stream's client from " + streamShortID);
        }
      }
      console.log(nodes);
      
      this.allStreamTags = this.flatten(alltags)
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
      this.dates = createdAts.map( d => ( new Date( d ) ).toLocaleString( 'en' ) )
      //this.dates = createdAts;
      this.sliderValue = [this.dates[0], this.dates[this.dates.length - 1]];
      //console.log(JSON.stringify(this.allStreamTagsJSON), 'lol')
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

// .transparent {
//    background-color: white!important;
//    opacity: 0.65;
//    border-color: transparent!important;
//  }
</style>
