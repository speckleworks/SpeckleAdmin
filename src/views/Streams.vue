<template>
  <v-container grid-list-xl>
    <v-toolbar fixed v-if='selectedStreams.length > 0' style='z-index:100'>
      <!-- <div class="md-layout-item md-size-100" xxxv-if='selectedStreams.length > 0' style="margin-top: 10px;"> -->
      <v-toolbar-items>
        <v-btn icon color='primary' class='md-raised md-dense md-primary' @click.native='clearSelection'>
          <v-icon>close</v-icon>
          <!-- clear -->
        </v-btn>
      </v-toolbar-items>
        <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn color='error' class='md-raised-xx md-dense md-accent' @click.native='deleteStreams'>delete</v-btn>
        <v-btn class='md-raised md-dense' @click.native='togglePermissions'>Make {{defaultPermission}}</v-btn>
        <v-btn class='md-raised md-dense' @click.native='createProjectFromSelection'>Create Project</v-btn>
      </v-toolbar-items>
      <!-- </div> -->
    </v-toolbar>
    <v-layout row wrap>
      <v-flex xs12 py-5 class='headline font-weight-light'>
        Streams are the channels your design data flows into.
      </v-flex>
      <v-flex xs12 v-if='streams.length === 0'>
        <p class='title font-weight-light'>Hmm, you don't have any streams yet. Don't worry! You can create a new one here (big blue button in the lower right corner) or through <router-link to='/plugins'>existing CAD integrations.</router-link>
        </p>
      </v-flex>
      <v-flex xs12 class='main-toolbar'>
        search
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex xs12 sm6 v-for='stream in paginatedStreams' :key='stream._id'>
        <stream-card :stream='stream' v-on:selected='selectThis' v-on:deleted='clearSelection'></stream-card>
      </v-flex>
      <v-flex xs12>
        <v-btn block class='md-raised btn-no-margin md-primary' @click.native='endIndex+=12' :disabled='paginatedStreams.length===filteredStreams.length'>
          Show More ({{paginatedStreams.length}} / {{filteredStreams.length}})
        </v-btn>
      </v-flex>
    </v-layout>
    <v-btn color="primary" dark fixed large bottom right fab>
      <v-icon>add</v-icon>
    </v-btn>
  </v-container>
  <!--   <md-empty-state md-icon="import_export" md-label="" md-description="You don't have any streams yet." v-if='streams.length === 0'>
    <p> You can create a new one here or through <router-link to='/plugins'>existing CAD integrations.</router-link>
    </p>
    <md-button class="md-primary md-raised" @click.native='createStream'>Create your first stream!</md-button>
  </md-empty-state> -->
  <!--   <div class='md-layout' v-else>
    <md-card class="md-elevation-0 md-layout-item md-size-100">
      <md-card-content>
        <h1 class='md-display-2'>Streams</h1>
        <p>Streams are the place where your project data (objects and other information) is kept.</p>
      </md-card-content>
    </md-card>
    <md-card class="md-primary-xx main-toolbar md-elevation-3">
      <md-card-content class='md-layout md-alignment-center-space-between'>
        <div class="md-layout-item md-size-95 md-small-size-70">
          <md-field md-clearable>
            <md-icon>search</md-icon>
            <label>filter query</label>
            <md-input @input="updateSearch" spellcheck="false"></md-input>
          </md-field>
        </div>
        <div class="md-layout-item md-size-5 md-small-size-30 text-right">
          <md-button class='md-icon-button md-raised md-primary' @click.native='createStream'>
            <md-icon>add</md-icon>
          </md-button>
        </div>
        <div class="md-layout-item md-size-100" v-if='selectedStreams.length > 0' style="margin-top: 10px;">
          <md-button class='md-raised md-dense md-primary' @click.native='clearSelection'>clear selection ({{selectedStreams.length}})</md-button>
          <md-button class='md-raised-xx md-dense md-accent' @click.native='deleteStreams'>delete</md-button>
          <md-button class='md-raised md-dense' @click.native='togglePermissions'>Make {{defaultPermission}}</md-button>
          <md-button class='md-raised md-dense' @click.native='createProjectFromSelection'>Create Project</md-button>
        </div>
      </md-card-content>
    </md-card>
    <div class='md-layout-item md-small-size-100 md-medium-size-50 md-large-size-50 md-xlarge-size-33' v-for='stream in paginatedStreams' :key='stream._id'>
      <stream-card :stream='stream' v-on:selected='selectThis' v-on:deleted='clearSelection'></stream-card>
    </div>
    <div class="md-layout-item md-size-100">
      <md-card class='md-elevation-0'>
        <md-button class='md-raised btn-no-margin md-primary' @click.native='endIndex+=12' :disabled='paginatedStreams.length===filteredStreams.length'>
          Show More ({{paginatedStreams.length}} / {{filteredStreams.length}})
        </md-button>
      </md-card>
    </div>
  </div> -->
</template>
<script>
import debounce from 'lodash.debounce'
import StreamCard from '../components/StreamCard.vue'

export default {
  name: 'StreamsView',
  components: { StreamCard },
  computed: {
    streams( ) {
      return this.$store.state.streams.filter( stream => stream.parent == null && stream.deleted === false ).sort( ( a, b ) => {
        return new Date( b.updatedAt ) - new Date( a.updatedAt );
      } )
    },
    filteredStreams( ) {
      return this.$store.getters.filteredStreams( this.filters )
    },
    paginatedStreams( ) {
      return this.filteredStreams.slice( this.startIndex, this.endIndex )
    },
  },
  data( ) {
    return {
      startIndex: 0,
      itemsPerPage: 12,
      endIndex: 12,
      selectedStreams: [ ],
      searchfilter: '',
      filters: [ ],
      defaultPermission: 'private',
    }
  },
  watch: {
    selectedStreams( ) {
      let priv = 0,
        pub = 0
      this.selectedStreams.forEach( s => {
        if ( s.private ) priv++
        else pub++
      } )
      this.defaultPermission = priv > pub ? 'public' : 'private'
    }
  },
  methods: {
    createStream( ) {
      this.$store.dispatch( 'createStream', { name: 'A New Speckle Stream', onlineEditable: true } )
        .then( res => {
          this.$router.push( `/streams/${res.streamId}` )
        } )
        .catch( err => {
          console.error( err )
        } )
    },
    createProjectFromSelection( ) {
      this.$store.dispatch( 'createProject', { name: 'Speckle Project', streams: this.selectedStreams.map( s => s.streamId ) } )
        .then( res => {
          this.clearSelection( )
          this.$router.push( `/projects/${res._id}` )
        } )
    },
    togglePermissions( ) {
      this.selectedStreams.forEach( stream => {
        this.$store.dispatch( 'updateStream', { streamId: stream.streamId, private: this.defaultPermission === 'private' ? true : false } )
      } )
      this.defaultPermission = this.defaultPermission === 'private' ? 'public' : 'private'
    },
    deleteStreams( ) {
      this.selectedStreams.forEach( stream => {
        this.$store.dispatch( 'updateStream', { streamId: stream.streamId, deleted: true } )
      } )
      this.clearSelection( )
    },
    updateSearch: debounce( function( e ) {
      this.searchfilter = e
      try {
        let filters = this.searchfilter.split( ' ' ).map( t => {
          if ( t.includes( ':' ) )
            return { key: t.split( ':' )[ 0 ], value: t.split( ':' )[ 1 ] }
          else if ( !t.includes( 'public' ) && !t.includes( 'private' ) && !t.includes( 'mine' ) && !t.includes( 'shared' ) ) // TODO: not elegant
            return { key: 'name', value: t }
          else
            return { key: t, value: null }
        } )
        this.filters = filters
      } catch {
        this.filters = [ { key: 'name', value: e } ]
      }
    }, 1000 ),
    selectThis( stream ) {
      let index = this.selectedStreams.findIndex( s => s.streamId === stream.streamId )
      if ( index === -1 )
        this.selectedStreams.unshift( stream )
      else
        this.selectedStreams.splice( index, 1 )
    },
    clearSelection( ) {
      this.defaultPermission = 'private'
      bus.$emit( 'unselect-all' )
    },
    checkSelection( ) {
      this.selectedStreams = this.selectedStreams.filter( s => !s.deleted )
    }
  },
  created( ) {
    // this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&deleted=false&sort=-lastModified' )
  }
}

</script>
<style scoped lang='scss'>
.md-field label {
  opacity: 0.5;
}

/*
.main-toolbar {
  position: -webkit-sticky;
  position: sticky;
  top:120px;
  width: 100%;
  z-index: 100;
  margin-bottom: 30px;
}*/

.md-field {
  margin: 0 !important;
}

</style>
