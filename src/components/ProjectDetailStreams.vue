<template>
  <md-card md-with-hover>
    <md-card-header class='bg-ghost-white'>
      <md-card-header-text>
        <h2 class='md-title'><md-icon>import_export</md-icon> Streams</h2>
        <p class='md-caption'>These are this project's streams. Adding a stream here will automatically grant write permission to the project's team members.</p>
      </md-card-header-text>
    </md-card-header>
    <md-card-content class='md-layout'>
      <div class='md-layout-item md-size-100' v-if='streams.length === 0'>
        <p>This project has no streams. Add some using the form below!</p>
      </div>
      <div class='md-layout-item md-size-100' v-else>
        <stream-card-small v-for='stream in streams' :streamId='stream'></stream-card-small>
      </div>
      <div class='md-layout-item md-size-100'>
        <md-field md-clearable>
          <md-icon>search</md-icon>
          <md-input @input="updateSearch" v-model='searchfilter' spellcheck="false"></md-input>
          <label>name:box id:xxx private:true</label>
        </md-field>
      </div>
      <div class='md-layout-item md-size-100 searched-stream' v-for='stream in paginatedStreams' v-if='filters.length > 0 && showSearchResults' @click='selectStream(stream.streamId)'>
        <div class="md-layout">
          <div class='md-layout-item md-size-40'>
            <strong>{{stream.name}}</strong>
          </div>
          <div class='md-layout-item md-size-20'>
            <span class='md-caption'>{{stream.streamId}}</span>
          </div>
          <div class='md-layout-item xxx-md-size-20 md-caption'>
            last update <strong><timeago :datetime='stream.updatedAt'></timeago></strong>
          </div>
        </div>
      </div>
    </md-card-content>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'
import StreamCardSmall from './StreamCardSmall.vue'

export default {
  name: 'ProjectStreams',
  components: {
    StreamCardSmall
  },
  props: {
    streams: Array,
  },
  computed: {
    filteredStreams( ) {
      return this.$store.getters.filteredStreams( this.filters ).filter( s => this.streams.indexOf( s.streamId ) === -1 )
    },
    paginatedStreams( ) {
      return this.filteredStreams.slice( this.startIndex, this.endIndex )
    }
  },
  watch: {
    searchfilter( val ) {
      if ( val === '' )
        this.showSearchResults = false
    }
  },
  data( ) {
    return {
      startIndex: 0,
      itemsPerPage: 12,
      endIndex: 12,
      filters: [ ],
      searchfilter: '',
      showSearchResults: false
    }
  },
  methods: {
    selectStream( streamId ) {
      this.$emit( 'selected-stream', streamId )
    },
    updateSearch: debounce( function( e ) {
      this.searchfilter = e
      if( e === '' ) {
        this.showSearchResults = false
        return
      }
      this.showSearchResults = true
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
  }
}

</script>
<style scoped lang='scss'>
.searched-stream {
  padding: 10px;
}

.searched-stream:hover {
  background-color: ghostwhite;
  cursor: pointer;
}

</style>
