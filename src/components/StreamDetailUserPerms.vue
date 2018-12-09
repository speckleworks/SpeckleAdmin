<template>
  <md-card class='md-elevation-3'>
    <md-card-content>
      <div class="md-title">Link sharing <md-button>ON</md-button></div>
      <p class='md-caption'>Anyone with the streamId can read the stream.</p>
      <div class="md-title">Permissions</div>
      <p class='md-caption' v-if='canEdit'>Changing permission here will override any project-based settings this stream might have.</p>
      <p class='md-caption' v-else>You can't change permissions.</p>
      <permission-table :resource='stream' v-on:update-table='updatePerms'></permission-table>
      <md-divider md-inset></md-divider>
      <p>Add users:</p>
      <user-search v-on:selected-user='addUserToWrite'></user-search>
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
