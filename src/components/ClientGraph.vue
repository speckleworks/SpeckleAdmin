<template>
  <v-card class="elevation-0">
    <v-toolbar class="elevation-0 transparent">
      <v-icon left small>share</v-icon>
      <span class="title font-weight-light">Projects Graph</span>
      <v-spacer></v-spacer>
      <span right>
        <v-btn icon @click="refresh()">
          <v-icon>refresh</v-icon>
        </v-btn>
      </span>
    </v-toolbar>
    <v-divider></v-divider>
    <v-card-text>
      <v-layout>
        <v-flex xs12>This graph represents the data flow between the project's users and clients.</v-flex>
      </v-layout>
    </v-card-text>
    <v-divider></v-divider>
    <div id="clientgraph">
      <div id="container" class="svg-container" align="center">
        <svg width="100%" height="600" id="graphLayout">
          <!-- <g id="pathLink"></g>
          <g id="circleSender"></g>
          <g id="circleReceiver"></g>
          <g id="rectStream"></g> -->
          <ForceDirectedLayout v-if="result" :clientdata="result"/>
        </svg>
      </div>
    </div>
  </v-card>
</template>
<script src="http://d3js.org/d3.v3.min.js" charset="utf-8"></script>
<script>
import ForceDirectedLayout from "./ForceDirectedLayout.vue";
import axios from "axios";
import Vue from "vue";
import AsyncComputed from "vue-async-computed";
Vue.use(AsyncComputed);
//
export default {
  name: "ClientGraph",
  components: {
    ForceDirectedLayout
  },
  props: {
    project: Object
  },
  data: () => ({
    result: null,
  }),
  methods: {
    refresh() {
      this.$asyncComputed.myResolvedValue.update();
    },

    
  },

  asyncComputed: {
    async myResolvedValue() {
      watch: ["fresh"];
      var streamLinks = [];
      var nodes = [];

      let resLogin;
      try {
        let resLogin = await axios.post(
          "https://hestia.speckle.works/api/accounts/login",
          { email: "p.poinet@ucl.ac.uk", password: "0403924199" }
        );
        axios.defaults.headers.common["Authorization"] =
          resLogin.data.resource.token;
      } catch (err) {
        console.log(err); // from creation.
        return;
      }

      let resProject;
      try {
        resProject = await axios.get(
          "https://hestia.speckle.works/api/projects/" +
            this.project._id
            //"5cc0417355797f03a2a79605"
        );
      } catch (err) {
        console.log(err); // from creation
        return;
      }

      var projectStreams = resProject.data.resource.streams;

      for (var i = 0; i < projectStreams.length; i++) {
        var streamShortID = projectStreams[i];
        let stream_id;

        let resStream;

        try {
          resStream = await axios.get(
            "https://hestia.speckle.works/api/streams/" + streamShortID
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
            "https://hestia.speckle.works/api/streams/" +
              streamShortID +
              "/clients"
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
      //
    //   nodes.sort(function(a, b) {
    //     return a.createdAt < b.createdAt
    //       ? -1
    //       : a.createdAt > b.createdAt
    //       ? 1
    //       : 0;
    //   });

    //   var placeholder_0 = nodes;
    //   var placeholder_1 = streamLinks;
    //   var links = [];
    //   for (let i = 0; i < placeholder_1.length; i++) {
    //     if (placeholder_1[i].action === "sending") {
    //       let source = placeholder_0
    //         .map(function(e) {
    //           if (e.type === "Client") {
    //             return e._id;
    //           }
    //         })
    //         .indexOf(placeholder_1[i].source);
    //       let target = placeholder_0
    //         .map(function(e) {
    //           return e._id;
    //         })
    //         .indexOf(placeholder_1[i].target);
    //       links.push({ source, target, type: `sending`, display: true });
    //     }
    //     if (placeholder_1[i].action === "receiving") {
    //       let source = placeholder_0
    //         .map(function(e) {
    //           return e._id;
    //         })
    //         .indexOf(placeholder_1[i].source);
    //       let target = placeholder_0
    //         .map(function(e) {
    //           if (e.type === "Client") {
    //             return e._id;
    //           }
    //         })
    //         .indexOf(placeholder_1[i].target);
    //       links.push({ source, target, type: `receiving`, display: true });
    //     }
    //   }
      this.result = [nodes, streamLinks];

      return [nodes, streamLinks];
    }
  }
};
</script>

<style>
#clientgraph {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 30px;
}


</style>
