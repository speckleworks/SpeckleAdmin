<template>
  <v-layout row wrap>
    <v-flex xs12 md8>
      <v-text-field
        solo
        v-model="search"
        append-icon="search"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-flex>
    <v-flex xs12 md1>
      <v-btn :disabled="buttonsDisabled" flat class='transparent' @click="archiveSelected(true)">Archive</v-btn>
    </v-flex>
    <v-flex xs12 md1>
      <v-btn :disabled="buttonsDisabled" flat class='transparent' @click="archiveSelected(false)">Restore</v-btn>
    </v-flex>
    <v-flex xs12 md1>
      <v-btn :disabled="buttonsDisabled" flat color='error' class='transparent' @click='showWarning = true'>Delete</v-btn>
    </v-flex>
    <v-flex xs12>
      <v-data-table
        :items="streams"
        :headers="headers"
        :loading="isGettingStreamData"
        :search="search"
        v-model="selected"
        item-key="name"
        select-all
      >
        <template v-slot:items="props">
          <tr :active="props.selected" @click="props.selected = !props.selected">
            <td>
              <v-checkbox color='primary' :input-value="props.selected" primary hide-details></v-checkbox>
            </td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.streamId }}</td>
            <td>{{ props.item.owner }}</td>
            <td>{{ props.item.private }}</td>
            <td>
              <v-checkbox disabled hide-details class="align-center justify-left" v-model=props.item.deleted></v-checkbox>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-flex>
    <v-dialog v-model="showWarning" max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline font-weight-light"><strong>Permanently</strong> delete these streams?</span>
          <v-progress-linear color='error' indeterminate v-show='showDeleteProgress'/>
        </v-card-title>
        <v-card-actions>
          <v-spacer/>
          <v-btn flat color='error' class='transparent' @click="deleteSelected()">Delete Permanently</v-btn>
          <v-btn @click="showWarning = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>
<script>
import debounce from "lodash.debounce";
import union from "lodash.union";
import Axios from "axios";
import uuid from "uuid/v4";
import papa from "papaparse";

export default {
  name: "AdminStreamsView",
  components: {},
  watch: {},
  computed: {
    buttonsDisabled(){
      if (this.selected.length > 0){
        return false
      }
      return true
    }
  },
  data() {
    return {
      streams: [],
      isGettingStreamData: false,
      selected: [],
      search: "",
      headers: [
        { text: "Name", value: "name" },
        { text: "Id", value: "streamdId" },
        { text: "Owner", value: "owner" },
        { text: "Private", value: "private" },
        { text: "Archived", value: "deleted"}
      ],
      showWarning: false,
      showDeleteProgress: false
    };
  },
  methods: {
    fetchData() {
      this.isGettingStreamData = true;
      Axios.get("streams/admin")
        .then(res => {
          this.streams = res.data.resources;
          this.isGettingStreamData = false;
        })
        .catch(err => {
          this.isGettingStreamData = false;
          // TODO: Handle error
          console.error(err);
        });
    },
    archiveSelected(boolean){
      let streamsToModify = this.selected.length
      this.selected.forEach(stream => {
        Axios.put("streams/" + stream.streamId, {deleted: boolean } ).then(res => {
          streamsToModify -= 1
          if (streamsToModify == 0) this.fetchData()
        })
      })
    },
    deleteSelected(){
      this.showDeleteProgress = true
      let streamsToDelete = this.selected.length
      this.selected.forEach(stream => {
        Axios.delete("streams/" + stream.streamId).then(res => {
          streamsToDelete -= 1
          if (streamsToDelete == 0) {
            this.showDeleteProgress = false
            this.showWarning = false
            this.fetchData()
          }
        })
      })
    }
  },
  mounted() {
    this.fetchData();
  }
};
</script>
<style scoped lang='scss'>
.detail-card {
  margin-bottom: 20px;
}

.md-content {
  padding: 30px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.md-card-content {
  padding: 0;
}

a:hover {
  cursor: pointer;
}
</style>
