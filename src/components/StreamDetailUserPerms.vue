<template>
  <md-card class='md-elevation-3' md-with-hover>
    <md-card-content class='bg-ghost-white'>
      <div class="md-layout md-alignment-center-center">
        <div class="md-layout-item md-title md-size-70">Link Sharing</div>
        <div class="md-layout-item md-title md-size-30 text-right">
          <md-button :class='{ "md-raised": true, "md-primary" : !stream.private }' @click.native='changeLinkSharing' :disabled='!canEdit'>
            {{stream.private ? "OFF" : "ON"}}
          </md-button>
        </div>
        <div class='md-layout-item md-size-100 md-caption'>
          {{ stream.private ? "Private resource. Only people with read or write persmissions can access it." : "Public resource. Anyone with the id can access it."}}
          <span class='md-layout-item md-size-100 md-caption' v-if='isOwner'>
          You own this stream.
        </span>
          <span class='md-layout-item md-size-100 md-caption' v-else>
          This stream was shared with you by <strong>{{streamOwner}}.</strong>
        </span></div>
      </div>
    </md-card-content>
    <md-card-content class='bg-ghost-white'>
      <div class="md-layout">
        <div class='md-layout-item md-size-100' style="margin-top:20px;">
          <div class="md-title">Permissions</div>
          <p class='md-caption'>Some users might be disabled as their permissions are set through projects.</p>
        </div>
      </div>
    </md-card-content>
    <md-card-content>
      <div class="md-layout">
        <div class='md-layout-item md-size-100' style="margin-top:0px;">
          <user-search v-on:selected-user='addUserToWrite' v-if='canEdit'></user-search>
          <permission-table :resource='stream' v-on:update-table='updatePerms'></permission-table>
        </div>
      </div>
    </md-card-content>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'
import uniq from 'lodash.uniq'
import Axios from 'axios'

import UserSearch from './UserSearch.vue'
import PermissionTable from './PermissionTable.vue'

export default {
  name: 'StreamDetailUserPerms',
  components: {
    UserSearch,
    PermissionTable
  },
  props: {
    stream: Object
  },
  computed: {
    streamOwner( ) {
      if ( this.isOwner ) return `${this.$store.state.user.name} ${this.$store.state.user.surname}`
      let owner = this.$store.state.users.find( user => user._id === this.stream.owner )
      if ( !owner ) return '(loading)'
      return `${owner.name} ${owner.surname} ${owner.company ? "(" + owner.company + ")" : ''}`
    },
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    }
  },
  data( ) {
    return {
      userSearch: '',
      foundUsers: [ ],
      searchInProgress: false
    }
  },
  methods: {
    changeLinkSharing( ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, private: !this.stream.private } )
    },
    addUserToWrite( userId ) {
      let canWrite = uniq( [ ...this.stream.canWrite, userId ] )
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, canWrite: canWrite } )
    },
    updatePerms( { canRead, canWrite } ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, canRead: canRead, canWrite: canWrite } )
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
