<template>
  <div>
    <div class='md-layout' v-if='project'>
      <div class="md-layout-item md-size-100">
        <md-card class='md-elevation-0'>
          <h1 class='md-display-1'>{{project.name}}</h1>
          {{project.description}}
        </md-card>
      </div>
      <div class="md-layout-item md-size-50 md-medium-size-100">
        <md-card>
          <md-card-header>
            <md-card-header-text>
              <h2 class='md-title'>Team Members</h2>
            </md-card-header-text>
          </md-card-header>
          <md-card-content>
            <permission-table :resource='project' v-on:update-table='updatePerms'></permission-table>
            <user-search v-on:selected-user='addUserToWrite'></user-search>
          </md-card-content>
        </md-card>
      </div>
      <div class="md-layout-item md-size-50 md-medium-size-100">
        <md-card>
          <md-card-header>
            <md-card-header-text>
              <h2 class='md-title'>Streams</h2>
            </md-card-header-text>
          </md-card-header>
          <md-card-content>
            {{project.streams}}
          </md-card-content>
        </md-card>
      </div>
      <div class="md-layout-item md-size-100 md-medium-size-100">
        <md-card>
          <md-card-header>
            <md-card-header-text>
              <h2 class='md-title'>Discussion</h2>
            </md-card-header-text>
          </md-card-header>
          <md-card-content>
            {{project.streams}}
          </md-card-content>
        </md-card>
      </div>
    </div>
    <div class='md-layout md-alignment-center-center' style="height: 95vh" v-else>
      <div class='md-layout-item md-size-50'>
        <md-progress-bar md-mode="indeterminate"></md-progress-bar>
      </div>
    </div>
  </div>
</template>
<script>
import union from 'lodash.union'
import uniq from 'lodash.uniq'

import UserSearch from '../components/UserSearch.vue'
import PermissionTable from '../components/PermissionTable.vue'

export default {
  name: 'ProjectDetailView',
  components: {
    UserSearch,
    PermissionTable
  },
  props: {

  },
  computed: {
    project( ) {
      return this.$store.state.projects.find( p => p._id === this.$route.params.projectId )
    }
  },
  data( ) { return {} },
  methods: {
    addUserToWrite( userId ) {
      let canWrite = uniq( [ ...this.project.canWrite, userId ] )
      this.$store.dispatch( 'updateProject', { _id: this.project._id, canWrite: canWrite } )
      //  TODO: propagate this to all streams
    },
    updatePerms( { canRead, canWrite } ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, canWrite: canWrite, canRead: canRead } )
      //  TODO: propagate this to all streams
    },
    addStream( ) {
      // add current users to stream canRead and canWrite
    },
    removeStream( ) {
      //
    },
  },
  mounted( ) {
    let project = this.$store.state.projects.find( p => p._id === this.$route.params.projectId )
    if ( !project ) {
      this.$store.dispatch( 'getProject', { _id: this.$route.params.projectId } )
        .then( res => {
          this.$store.dispatch( 'getUser', { _id: res.data.resource.owner } )
          union( res.data.resource.canRead, res.data.resource.canWrite ).forEach( _id => this.$store.dispatch( 'getUser', { _id: _id } ) )
        } )
        .catch( err => {
          console.log( err )
        } )
    } else {
      this.$store.dispatch( 'getUser', { _id: project.owner } )
      union( project.canRead, project.canWrite ).forEach( _id => this.$store.dispatch( 'getUser', { _id: _id } ) )
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
