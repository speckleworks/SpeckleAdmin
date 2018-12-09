<template>
  <div>
    <md-field md-clearable>
      <label>Search for a user</label>
      <md-input v-model='userSearch' @input='startSearchUsers'></md-input>
    </md-field>
    <md-progress-spinner md-mode="indeterminate" :md-diameter='20' :md-stroke='2' v-show='searchInProgress'></md-progress-spinner>
    <div class='md-layout'>
      <div class="md-layout-item md-size-100" v-for='user in foundUsers' v-if='userSearch!==null && foundUsers.length > 0'>
        <div class="md-layout user-list md-alignment-center-left" @click='selectUser(user._id)'>
          <div class="md-layout-item md-size-10 ">
            <md-avatar class="md-avatar-icon md-small">{{user.name.substring(0,1).toUpperCase()}}</md-avatar>
          </div>
          <div class="md-layout-item md-size-60">
            {{user.name}} {{user.surname}} <span v-if='user.company' class='md-caption'>({{user.company}})</span>
          </div>
        </div>
      </div>
      <div v-if='foundUsers.length === 0 && userSearch!==""' class='md-caption'>
        No users found. Try a different search!
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash.debounce'
import Axios from 'axios'

export default {
  name: 'UserSearch',
  props: {
    msg: String
  },
  data( ) {
    return {
      userSearch: '',
      foundUsers: [ ],
      searchInProgress: false
    }
  },
  methods: {
    selectUser( userId ) {
      this.$emit( 'selected-user', userId )
      let index = this.foundUsers.findIndex( u => u._id === userId )
      this.foundUsers.splice( index, 1 )
    },
    startSearchUsers( ) {
      this.searchInProgress = true
      this.searchUsers( this.userSearch )
    },
    searchUsers: debounce( function( searchString ) {
      if ( searchString === '' ) {
        this.foundUsers = [ ]
        this.searchInProgress = false
      }
      if ( searchString.length < 3 ) {
        // TODO: Show an error
        return
      }
      Axios.post( '/accounts/search', { searchString: searchString } )
        .then( res => {
          console.log( res )
          this.foundUsers = res.data.resources
          // build up a db of users
          if ( res.data.resources.length > 0 )
            this.$store.commit( 'ADD_USERS', res.data.resources )
          this.searchInProgress = false
        } )
        .catch( err => {
          this.foundUsers = [ ]
          this.searchInProgress = false
        } )
    }, 1500 )
  }
}

</script>
<style scoped lang='scss'>
.user-list {
  margin-bottom: 5px;
  padding: 5px;
}

.user-list:hover {
  background-color: #F4F4F4;
  cursor: pointer;
}

</style>
