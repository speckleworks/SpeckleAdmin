<template>
  <v-layout align-center row wrap>
    <v-flex xs12 class=''>
      <v-text-field box label='Search for a user to add' clearable v-model='userSearch' flat :loading='searchInProgress' prepend-inner-icon="search" @input='startSearchUsers'></v-text-field>
    </v-flex>
    <v-flex xs12>
      <v-container grid-list-lg v-if='userSearch!==null && foundUsers.length > 0' class='ma-0 pa-0 mb-4'>
        <v-layout row wrap>
          <v-flex xs12 sm6 lg4 v-for='user in foundUsers' :key='user._id'>
            <v-hover>
              <v-card @click.native='selectUser(user._id)' tile slot-scope="{ hover }" :class="`px-3 py-2 elevation-${hover ? 12 : 1} ${hover ? 'hovered' : '' }`">
                <span></span>
                <v-avatar size='21' dark :color="getHexFromString( user.name )">
                  {{user.name.substring(0,1).toUpperCase()}}
                </v-avatar>&nbsp;
                <span>{{user.name}} {{user.surname}}</span>&nbsp;
                <span class='caption'>{{user.company}}</span>
              </v-card>
            </v-hover>
          </v-flex>
        </v-layout>
      </v-container>
      <v-container class='ma-0 pa-0' v-if='foundUsers.length === 0 && userSearch && userSearch!=="" && !searchInProgress'>
        No users found. Try a different search criteria.
      </v-container>
    </v-flex>
  </v-layout>
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
  watch: {
    userSearch( newVal, oldVal ) {
      if ( newVal === '' ) {
        this.foundUsers = [ ]
        this.searchInProgress = false
      }
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
      if ( searchString === '' || searchString === null ) {
        this.foundUsers = [ ]
        this.searchInProgress = false
        return
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
.hovered {
  cursor: pointer;
}

</style>
