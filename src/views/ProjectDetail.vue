<template>
  <div>
    <div class='md-layout' v-if='project'>
      <div class="md-layout-item md-size-100">
        <project-detail-title :project='project'></project-detail-title>
      </div>
      <div class="md-layout-item md-size-50 md-medium-size-100 detail-card">
        <md-card md-with-hover>
          <md-card-header class='bg-ghost-white'>
            <md-card-header-text>
              <h2 class='md-title'><md-icon>group</md-icon> Team Members</h2>
              <p class='md-caption'>The following people will have access to the streams in this project, and will be able to view this project. Updating permissions here will override any previously set permissions for this stream.</p>
            </md-card-header-text>
          </md-card-header>
          <md-card-content>
            <user-search v-on:selected-user='addUserToTeam'></user-search>
            <permission-table :resource='project.permissions' v-on:update-table='updateTeamPerms'></permission-table>
          </md-card-content>
        </md-card>
        <br>
        <project-detail-streams :streams='project.streams' v-on:selected-stream='addStream' v-on:remove-stream='removeStream'></project-detail-streams>
      </div>
      <div class="md-layout-item md-size-50 md-medium-size-100 detail-card">
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
import ProjectDetailStreams from '../components/ProjectDetailStreams.vue'
import ProjectDetailTitle from '../components/ProjectDetailTitle.vue'

export default {
  name: 'ProjectDetailView',
  components: {
    UserSearch,
    PermissionTable,
    ProjectDetailStreams,
    ProjectDetailTitle
  },
  props: {

  },
  computed: {
    canEdit( ) {
      return this.project.owner === this.$store.state.user._id || this.project.canWrite.indexOf( this.$store.state.user._id ) > -1
    },
    project( ) {
      return this.$store.state.projects.find( p => p._id === this.$route.params.projectId )
    }
  },
  data( ) {
    return {

    }
  },
  methods: {
    addUserToTeam( userId ) {
      // adds user to project's map of permissions, straight into canWrite
      let permissions = {
        canWrite: uniq( [ ...this.project.permissions.canWrite, userId ] ),
        canRead: this.project.permissions.canRead
      }
      // adds user to project canRead so it shows up in his project tab
      let canRead = uniq( [ ...this.project.canRead, userId ] )
      this.$store.dispatch( 'updateProject', { _id: this.project._id, permissions: permissions, canRead: canRead } )
      //  TODO: propagate this to all streams
    },
    updateTeamPerms( { canRead, canWrite } ) {
      let projectCanRead = canRead
        this.$store.dispatch( 'updateProject', { _id: this.project._id, permissions: { canWrite: canWrite, canRead: canRead } } )
      //  TODO: propagate this to all streams
    },
    addStream( streamId ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, streams: uniq( [ ...this.project.streams, streamId ] ) } )
      // TODO propagate permissions users & streams
    },
    removeStream( streamId ) {
      console.log( `remove ${streamId}` )
      let streams = this.project.streams.filter( s => s !== streamId )
      this.$store.dispatch( 'updateProject', { _id: this.project._id, streams: streams } )
      // TODO: Remove users from stream
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
.detail-card {
  margin-bottom: 20px;
}

</style>
