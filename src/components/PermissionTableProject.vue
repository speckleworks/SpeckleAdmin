<template>
  <div>
    <div class='' v-if='project'>
      <div v-if='allUsersPop.length === 0'>
        No sharing buddies so far!
      </div>
      <div :class='{ "md-layout md-alignment-center-left user":true, "bg-ghost-white": user.isOwner}' v-for='user in allUsersPop' v-if='user'>
        <div class="md-layout-item md-size-10 md-small-hide">
          <md-avatar class="md-avatar-icon md-small" :style='{ "background" : getHexFromString( user.name ) }'>{{user.name.substring(0,1).toUpperCase()}}</md-avatar>
        </div>
        <div class="md-layout-item xxx-md-size-40 md-xsmall-size-100 text-center">
          {{user.name}} {{user.surname}}&nbsp<span v-if='user.company' class='md-caption'>({{user.company}})</span>&nbsp<span v-if='user.isOwner'><strong>owner</strong> </span>
        </div>
        <div class="md-layout-item text-center md-xsmall-size-100">
          <md-button :class='{ "md-dense md-raised-xx": true, "md-primary" : hasWritePermissionStreams(user._id)}' @click.native='changePermissionStreams(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || user.isOwner'>
            {{hasWritePermissionStreams(user._id) ? "write streams" : "read streams"}}
          </md-button>
        </div>
        <div class="md-layout-item text-center md-xsmall-size-100">
          <md-button :class='{ "md-dense md-raised-xx": true, "md-primary" : hasWritePermissionProject(user._id)}' @click.native='changePermissionProject(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || user.isOwner'>
            {{hasWritePermissionProject(user._id) ? "write project" : "read project"}}
          </md-button>
        </div>
        <div class="md-layout-item text-center md-size-5 md-xsmall-size-100">
          <md-button class='md-dense-xxx md-icon-button md-accent' @click.native='removeUser(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || user.isOwner'>
            <md-icon>delete</md-icon>
          </md-button>
        </div>
        <div class="md-layout-item md-size-100"><md-divider></md-divider></div>
        <div class="md-layout-item md-size-100">
          <!-- <md-divider></md-divider> -->
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import union from 'lodash.union'
import uniq from 'lodash.uniq'


export default {
  name: 'PermissionTable',
  props: {
    project: Object,
    globalDisabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    canReadProject( ) { return this.project.canRead },
    canWriteProject( ) { return this.project.canWrite },
    canReadStreams( ) { return this.project.permissions.canRead },
    canWriteStreams( ) { return this.project.permissions.canWrite },
    allUsers( ) {
      return uniq( [ ...this.canReadProject, ...this.canWriteProject, ...this.canReadStreams, ...this.canWriteProject, this.project.owner ] )
    },
    allUsersPop( ) {
      if ( this.allUsers.length === 0 ) return [ ]
      return this.allUsers.map( userId => {
        let u = this.$store.state.users.find( user => user._id === userId )
        if ( !u ) this.$store.dispatch( 'getUser', { _id: userId } )
        if ( u ) u.isOwner = u._id === this.project.owner
        return u
      } ).sort( ( a, b ) => a.name > b.name ? 1 : -1 )
    }
  },
  data( ) {
    return {}
  },
  methods: {
    hasWritePermissionStreams( _id ) {
      return this.canWriteStreams.indexOf( _id ) > -1
    },
    hasWritePermissionProject( _id ) {
      return this.canWriteProject.indexOf( _id ) > -1
    },
    changePermissionProject( _id ) {
      let canWrite = this.project.canWrite.indexOf( _id ) > -1 ? true : false
      let localCanWrite = [ ],
        localCanRead = [ ],
        streamCanWrite = this.project.permissions.canWrite,
        streamCanRead = this.project.permissions.canRead

      if ( canWrite ) {
        localCanWrite = this.project.canWrite.filter( uId => uId !== _id )
        localCanRead = uniq( [ ...this.project.canRead, _id ] )
      } else {
        localCanRead = this.project.canRead
        localCanWrite = uniq( [ ...this.project.canWrite, _id ] )
        // TODO: UPGRADE STREAMS CANWRITE TOO (otherwise user x can edit the project but not do much)
        streamCanWrite = uniq( [ ...streamCanWrite, _id ] )
        this.upgradeUser( _id )
      }

      this.$store.dispatch( 'updateProject', { _id: this.project._id, permissions: { canRead: streamCanRead, canWrite: streamCanWrite }, canRead: localCanRead, canWrite: localCanWrite } )
    },
    changePermissionStreams( _id ) {
      let hasWritePermission = this.project.permissions.canWrite.indexOf( _id ) > -1 ? true : false
      // Project permissions first
      let localCanRead = [ ],
        localCanWrite = [ ]
      if ( hasWritePermission ) {
        localCanWrite = this.project.permissions.canWrite.filter( uId => uId !== _id )
        localCanRead = uniq( [ ...this.project.permissions.canRead, _id ] )
      } else {
        localCanRead = this.project.permissions.canRead
        localCanWrite = uniq( [ ...this.project.permissions.canWrite, _id ] )
      }
      this.$store.dispatch( 'updateProject', { _id: this.project._id, permissions: { canRead: localCanRead, canWrite: localCanWrite } } )

      // Propagate to streams
      if ( !hasWritePermission ) this.upgradeUser( _id )
      else this.downgradeUser( _id )
    },
    upgradeUser( _id ) {
      // upgading a user should be straigtforward; just add him to all the stream's can read.
      // since we're giving MORE permissions, this shouldn't be a problem.
      this.project.streams.forEach( streamId => {
        let myStream = this.$store.state.streams.find( s => s.streamId === streamId )
        if ( myStream ) {
          let localCanWrite = uniq( [ ...myStream.canWrite, _id ] )
          this.$store.dispatch( 'updateStream', { streamId: streamId, canWrite: localCanWrite } )
        }
      } )
    },
    downgradeUser( _id ) {
      // downgrading a user is trickier: if he has write permissions from a previous project,
      // we cannot downgrade his permission level (as it results in conflicts down the line)
      this.project.streams.forEach( streamId => {
        let myStream = this.$store.state.streams.find( s => s.streamId === streamId )
        if ( myStream ) {
          let otherProjects = this.$store.state.projects.filter( p => p.streams.indexOf( streamId ) !== -1 && p._id !== this.project._id )
          let otherCanRead = Array.prototype.concat( ...otherProjects.map( op => op.permissions.canRead ) )
          let otherCanWrite = Array.prototype.concat( ...otherProjects.map( op => op.permissions.canWrite ) )
          console.log( otherCanRead )
          let canWrite = myStream.canWrite,
            canRead = myStream.canRead,
            anyChange = false
          // if this user DOES NOT HAVE write permissions from another project, we can downgrade him on this stream.
          if ( otherCanWrite.indexOf( _id ) === -1 ) {
            canWrite = canWrite.filter( uId => uId !== _id )
            canRead = uniq( [ ...canRead, _id ] )
            this.$store.dispatch( 'updateStream', { streamId: streamId, canWrite: canWrite, canRead: canRead } )
          } else {
            console.warn( `User ${_id} has write permissions from another project on stream ${streamId}. Will not change.` )
          }
        }
      } )
    },
    removeUser( userId ) {
      // console.log( `removing user from team; _id: ${userId}` )
      // Remove user from project team
      let pCanRead = this.project.permissions.canRead.filter( _id => _id !== userId )
      let pCanWrite = this.project.permissions.canWrite.filter( _id => _id !== userId )

      let rCanRead = this.project.canRead.filter( _id => _id !== userId )
      let rCanWrite = this.project.canWrite.filter( _id => _id !== userId )

      this.$store.dispatch( 'updateProject', { _id: this.project._id, permissions: { canRead: pCanRead, canWrite: pCanWrite }, canRead: rCanRead, canWrite: rCanWrite } )

      // Remove user from all streams
      this.project.streams.forEach( streamId => {
        let myStream = this.$store.state.streams.find( s => s.streamId === streamId )
        if ( myStream ) {
          // Checks if this stream is in another project that contains this userId
          let otherProjects = this.$store.state.projects.filter( p => p.streams.indexOf( streamId ) !== -1 && p._id !== this.project._id )
          let otherCanRead = Array.prototype.concat( ...otherProjects.map( op => op.permissions.canRead ) )
          let otherCanWrite = Array.prototype.concat( ...otherProjects.map( op => op.permissions.canWrite ) )

          let canWrite = myStream.canWrite,
            canRead = myStream.canRead,
            anyChange = false

          // only remove him from the stream's permissions if no conflicts with other projects.
          if ( otherCanRead.indexOf( userId ) === -1 ) {
            canRead = myStream.canRead.filter( _id => _id !== userId )
            anyChange = true
          }
          if ( otherCanWrite.indexOf( userId ) === -1 ) {
            canWrite = myStream.canWrite.filter( _id => _id !== userId )
            anyChange = true
          }

          if ( anyChange )
            this.$store.dispatch( 'updateStream', { streamId: streamId, canRead: canRead, canWrite: canWrite } )
        }
      } )
    }
  },
  mounted( ) {}
}

</script>
<style scoped lang='scss'>
.user {
  padding: 2px 10px;
}

</style>
