<template>
  <v-layout row wrap>
    <v-flex xs12 md9>
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
        :items='projects'
        :headers='headers'
        :loading='isGettingProjectData'
        :search='search'
        v-model="selected"
        item-key="name"
        select-all
      >
        <template v-slot:items="props">
          <tr :active="props.selected" @click="props.selected = !props.selected">
            <td>
              <v-checkbox
                color='primary' :input-value="props.selected"
                primary
                hide-details
              ></v-checkbox>
            </td>
            <td>{{ props.item.name }}</td>
            <td >{{ props.item.owner }}</td>
            <td >{{ props.item.streams.length }}</td>
            <td >{{ props.item.private }}</td>
            <td >{{ props.item.permissions.canRead.length + 1 }}</td>
            <td >{{ props.item.permissions.canWrite.length + 1}}</td>
            <td >
              <v-checkbox disabled hide-details class="align-center justify-left" v-model=props.item.deleted></v-checkbox>
            </td>
            <td>
              <v-btn small color='primary' :to='"/projects/"+props.item._id'>Details</v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-flex>
    <v-dialog v-model="showWarning" max-width="500">
      <v-card>
        <v-card-title>
          <span class="headline font-weight-light"><strong>Permanently</strong> delete these projects?</span>
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
import debounce from 'lodash.debounce'
import union from 'lodash.union'
import Axios from 'axios'
import uuid from 'uuid/v4'

export default {
  name: 'AdminProjectsView',
  components: {
  },
  watch: {
  },
  computed: {
    buttonsDisabled(){
      if (this.selected.length > 0){
        return false
      }
      return true
    }

  },
  data( ) {
    return {
      projects: [],
      isGettingProjectData: false,
      selected: [],
      search: "",
      headers: [
        { text: 'Name', value: 'name'},
        { text: 'Owner', value: 'owner' },
        { text: 'Streams', value: 'streams.length'},
        { text: 'Private', value: 'private' },
        { text: 'Read Users:', value: 'permissions.canRead.length'},
        { text: 'Write Users:', value: 'permissions.canWrite.length'},
        { text: "Archived", value: "deleted"},
        { text: '', value: ''}
      ],
      showWarning: false,
      showDeleteProgress: false
    }
  },
  methods: {
    fetchData() {
      this.isGettingProjectData = true
      Axios.get( 'projects/admin' )
        .then( res => {
          this.projects = res.data.resources
          this.isGettingProjectData = false
        } )
        .catch( err => {
          this.isGettingProjectData = false
          // TODO: Handle error
          console.error( err )
        } )
    },
    ownerName(owner){
      Axios.get( `accounts/${owner}` )
        .then( res => {
          console.log(res.data.resource)
          return res.data.resource.name + " " + res.data.resource.surname
        } )
        .catch( err => {
          // TODO: Handle error
          console.error( err )
          return "Coundn't get name"
        } )
    },
    archiveSelected(boolean){
      let projectsToModify = this.selected.length
      this.selected.forEach(project => {
        Axios.put("projects/" + project._id, {deleted: boolean } ).then(res => {
          projectsToModify -= 1
          if (projectsToModify == 0) this.fetchData()
        })
        .catch( err => {
          // TODO: Handle error
          console.error( err )
          return "Coundn't archive project"
        } )
      })
    },
    deleteSelected(){
      this.showDeleteProgress = true
      let projectsToDelete = this.selected.length
      this.selected.forEach(project => {
        Axios.delete("projects/" + project._id).then(res => {
          projectsToDelete -= 1
          if (projectsToDelete == 0) {
            this.showDeleteProgress = false
            this.showWarning = false
            this.fetchData()
          }
        })
        .catch( err => {
          // TODO: Handle error
          console.error( err )
          return "Coundn't delete project"
        } )
      })
    }
  },
  mounted( ) {
    this.fetchData()
  }
}

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
