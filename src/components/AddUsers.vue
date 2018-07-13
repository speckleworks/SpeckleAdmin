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
        <div class='md-subheading'>Search for users by typing parts of their name, surname, or company:</div>
        <md-field md-clearable>
          <label for="name">Name</label>
          <md-input name="name" id="name" v-model="searchCriteria.name"></md-input>
        </md-field>
        <md-field md-clearable>
          <label for="surname">Surname</label>
          <md-input name="surname" id="surname" v-model="searchCriteria.surname"></md-input>
        </md-field>
        <md-field md-clearable>
          <label for="company">Company</label>
          <md-input name="company" id="company" v-model="searchCriteria.company"></md-input>
        </md-field>
      </div>
    </div>
    <div class="md-layout md-alignment-center-center spk-padding" v-if='searchResults.length==0'>
      <h3>No users found</h3>
    </div>
    <md-content class="md-scrollbar spk-usersearch-results">
      <div class="md-layout md-alignment-center-center spk-padding spk-cell-users md-gutter" v-for='user in searchResults'>
        <div class='md-layout-item md-size-30 truncate'>{{user.name}} {{user.surname}}</div>
        <div class='md-layout-item md-size-30 md-caption truncate'>{{user.email || ''}}</div>
        <div class='md-layout-item md-size-20 md-caption md-text-center truncate'>{{user.company || 'n/a'}}</div>
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
    searchCriteria: {
      handler: function ( ) { this.debounceSearch( this.searchCriteria, this ) },
      deep: true,
      immediate: true
    }
  },
  computed: {},
  data( ) {
    return {
      searchCriteria: {
        name: '',
        surname: '',
        company: ''
      },
      searchResults: [ ]
    }
  },
  methods: {
    debounceSearch: debounce( ( searchCriteria, vm ) => {
      let state = vm.$store.state
      Axios.post( state.server + '/accounts/search', searchCriteria, { headers: { Authorization: state.token } } )
        .then( res => {
          vm.setResults( res.data.resources )
        } )

    }, 300 ),
    search( ) {
      console.log( 'search!' )
    },
    setResults( res ) {
      this.searchResults = res.filter( usr => usr._id != this.$store.state.user._id )
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
