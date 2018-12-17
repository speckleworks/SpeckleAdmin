<template>
  <div>
    <div class='md-layout md-alignment-center-center' v-if='project'>
      <div class="md-layout-item md-size-100">
      </div>
      <div class="md-layout-item md-size-50 md-large-size-65 md-medium-size-100 detail-card">
        <project-detail-title :project='project'></project-detail-title>
        <detail-description :resource='project'></detail-description>
        <br>
        <md-card md-with-hover>
          <md-card-header class='bg-ghost-white'>
            <md-card-header-text>
              <h2 class='md-title'><md-icon>group</md-icon> Team Members</h2>
              <p class='md-caption'>The following people will have access to the streams in this project, and will be able to view this project. Please note, users with higher privileges from other projects will not be downgraded or removed.</p>
            </md-card-header-text>
          </md-card-header>
          <md-card-content>
            <user-search v-on:selected-user='addUserToTeam' v-if='canEdit'></user-search>
            <permission-table :project='project' :global-disabled='!canEdit' @remove-user='' @move-user=''></permission-table>
          </md-card-content>
        </md-card>
        <br>
        <project-detail-streams :project='project' v-on:selected-stream='addStream' v-on:remove-stream='removeStream'></project-detail-streams>
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
import PermissionTable from '../components/PermissionTableProject.vue'
import DetailDescription from '../components/DetailDescription.vue'
import ProjectDetailStreams from '../components/ProjectDetailStreams.vue'
import ProjectDetailTitle from '../components/ProjectDetailTitle.vue'

export default {
  name: 'ProjectDetailView',
  components: {
    UserSearch,
    PermissionTable,
    DetailDescription,
    ProjectDetailStreams,
    ProjectDetailTitle
  },
  props: {},
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
      this.project.streams.forEach( streamId => {
        let myStream = this.$store.state.streams.find( s => s.streamId === streamId )
        if ( myStream ) {
          let canWrite = uniq( [ ...myStream.canWrite, userId ] )
          this.$store.dispatch( 'updateStream', { streamId: streamId, canWrite: canWrite } )
        } else {
          console.error( `Failed to find ${streamId} while updating permissions from project.` )
        }
      } )
    },
    addStream( streamId ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, streams: uniq( [ ...this.project.streams, streamId ] ) } )

      // TODO propagate permissions users & streams
      let myStream = this.$store.state.streams.find( s => s.streamId === streamId )
      let canRead = uniq( [ ...myStream.canRead, ...this.project.permissions.canRead ] )
      let canWrite = uniq( [ ...myStream.canWrite, ...this.project.permissions.canWrite ] )

      this.$store.dispatch( 'updateStream', { streamId: streamId, canRead: canRead, canWrite: canWrite } )
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
          if ( this.$store.state.isAuth ) {
            this.$router.push( '/projects' )
            console.log( "you don't have permission." )
          } else {
            console.log( "should redirect to login" )
            this.$router.push( '/login' )
          }
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
