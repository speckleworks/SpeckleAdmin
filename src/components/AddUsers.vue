<template>
  <div>
    <md-app-toolbar class="md-primary md-dense" style='height: 30px'>
      <div class="md-toolbar-section-start">
        <div class="md-toolbar-row">
          <md-button class='md-dense md-icon-button' @click='$emit("close")'>
            <md-icon>close</md-icon>
          </md-button>
          <p>User search</p>
        </div>
      </div>
    </md-app-toolbar>
    <div class="md-layout md-alignment-center-center spk-padding spk-useradd-dialog">
      <div class="md-layout-item md-size-100">
        <div class='md-subheading'>Search for users by typing their email below:</div>
        <md-field md-clearable :class="{ 'md-invalid' : errors.has('search string') }">
          <md-input v-model="searchCriteria" v-validate data-vv-name="search string" data-vv-rules="min:3"></md-input>
          <span v-show="errors.has('search string')" class="md-error">{{ errors.first('search string') }}</span>
        </md-field>
      </div>
    </div>
    <div class="md-layout md-alignment-center-center spk-padding" v-if='searchResults.length==0 && searchCriteria.length > 2'>
      <h3>No users found</h3>
    </div>
    <md-content class="md-scrollbar spk-usersearch-results">
      <div class="md-layout md-alignment-center-center spk-padding spk-cell-users md-gutter" v-for='user in searchResults'>
        <div class='md-layout-item md-size-30 truncate'>{{user.name}} {{user.surname}}</div>
        <div class='md-layout-item md-size-30 md-caption truncate'>{{user.email}}</div>
        <div class='md-layout-item md-size-20 md-caption md-text-center truncate'>{{user.company ? user.company : 'n/a'}}</div>
        <div class='md-layout-item md-size-20'>
          <md-button class="md-icon-button md-dense" @click='addUser(user)'>
            <md-icon>add</md-icon>
          </md-button>
        </div>
      </div>
    </md-content>
  </div>
</template>
<script>
import debounce from 'lodash.debounce'
import Axios from 'axios'

export default {
  props: [

  ],
  watch: {
    searchCriteria( ) { this.debounceSearch( this.searchCriteria, this ) }
  },
  computed: {},
  data( ) {
    return {
      searchCriteria: '',
      searchResults: [ ]
    }
  },
  methods: {
    debounceSearch: debounce( ( searchCriteria, vm ) => {
      let state = vm.$store.state
      if ( searchCriteria.length < 2 ) return vm.setResults( [ ] )
      Axios.post( state.server + '/accounts/search', { email: searchCriteria }, { headers: { Authorization: state.token } } )
        .then( res => {
          vm.setResults( res.data.users )
        } )

    }, 300 ),
    search( ) {
      console.log( 'search!' )
    },
    setResults( res ) {
      this.searchResults = res.filter( usr => usr.email != this.$store.state.user.email )
    },
    addUser( user ) {
      user.canRead = true
      user.canWrite = false
      this.searchResults.splice( this.searchResults.indexOf( user ), 1 )
      this.$emit( 'addUser', user )
    }
  },
  mounted( ) {}
}

</script>
<style lang="scss">
.truncate {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spk-useradd-dialog {
  min-width: 500px;
  padding-top: 30px;
}

.spk-usersearch-results {
  max-height: 100px;
  overflow: auto;
  overflow-x: hidden;
}

</style>
