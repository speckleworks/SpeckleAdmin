<template>
  <v-container grid-list-sm v-if='allUsersPop.length > 0 && project' class='pa-0 ma-0'>
    <v-layout row wrap>
      <v-flex xs12 sm12 lg12 v-for='user in allUsersPop' v-if='user' :key='user._id'>
        <v-card tile class='pa-3 elevation-1'>
          <v-layout row wrap align-center justify-space-between>
            <v-flex xs12>
              <v-avatar size='21' dark :color="getHexFromString( user.name )">
                {{user.name.substring(0,1).toUpperCase()}}
              </v-avatar>&nbsp;
              <span>{{user.name}} {{user.surname}}</span>&nbsp;
              <span class='caption'>{{user.company}}</span>
            </v-flex>
            <v-flex xs12 class='xxxtext-xs-right'>
              <!-- write streams -->
              <v-btn depressed small :color='hasWritePermissionStreams(user._id)?"primary":""' @click.native='changePermissionStreams(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || user.isOwner'>
                {{ user.isOwner ? "write streams" : hasWritePermissionStreams(user._id) ? "write streams" : "read streams"}}
              </v-btn>
              <!-- write project -->
              <v-btn depressed small :color='hasWritePermissionProject(user._id)?"primary":""' @click.native='changePermissionProject(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || user.isOwner'>
                {{ user.isOwner ? "write project" : hasWritePermissionProject(user._id) ? "write project" : "read project"}}
              </v-btn>
              <!-- remove user -->
              <v-btn small icon @click.native='removeUser(user._id)' :disabled='user.surname.includes(`(that is you!)`) || globalDisabled || user.isOwner'>
                <v-icon>close</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
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
    changePermissionProject( userId ) {
      let canWrite = this.project.canWrite.indexOf( userId ) > -1 ? true : false
      let localCanWrite = [ ],
        localCanRead = [ ],
        streamCanWrite = this.project.permissions.canWrite,
        streamCanRead = this.project.permissions.canRead

      if ( canWrite ) {
        localCanWrite = this.project.canWrite.filter( uId => uId !== userId )
        localCanRead = uniq( [ ...this.project.canRead, userId ] )
      } else {
        localCanRead = this.project.canRead
        localCanWrite = uniq( [ ...this.project.canWrite, userId ] )
        // TODO: UPGRADE STREAMS CANWRITE TOO (otherwise user x can edit the project but not do much)
        streamCanWrite = uniq( [ ...streamCanWrite, userId ] )
        this.upgradeUser( userId )
      }
      this.$store.dispatch( 'updateProject', { _id: this.project._id, permissions: { canRead: streamCanRead, canWrite: streamCanWrite }, canRead: localCanRead, canWrite: localCanWrite } )
    },
    changePermissionStreams( userId ) {
      let hasWritePermission = this.project.permissions.canWrite.indexOf( userId ) > -1 ? true : false
      if ( !hasWritePermission ) this.upgradeUser( userId )
      else this.downgradeUser( userId )
    },
    upgradeUser( userId ) {
      this.$store.dispatch( 'upgradeUserInProject', { projectId: this.project._id, userId: userId } )
    },
    downgradeUser( userId ) {
      this.$store.dispatch( 'downgradeUserInProject', { projectId: this.project._id, userId: userId } )
    },
    removeUser( userId ) {
      this.$store.dispatch( 'removeUserInProject', { projectId: this.project._id, userId: userId } )
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
