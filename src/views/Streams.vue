<template>
  <div class='md-layout'>
    <md-card class="md-primary-xx main-toolbar md-elevation-3">
      <md-card-content class='md-layout md-alignment-center-space-between'>
        <div class="md-layout-item md-size-30 md-small-size-100">
          <md-field md-clearable md-theme='dark'>
            <md-icon>search</md-icon>
            <label>name:box id:xxx private:true</label>
            <md-input @input="updateSearch"></md-input>
          </md-field>
        </div>
        <div class="md-layout-item md-size-50 md-small-size-100" v-if='selectedStreams.length > 0' style="text-align: right">
          <md-button class='md-raised md-dense md-accent'>delete</md-button>
          <md-button class='md-raised md-dense'>Make Private</md-button>
          <md-button class='md-raised md-dense' v-if='selectedStreams.length > 1'>Create Project</md-button>
          <md-button class='md-raised md-dense' @click.native='clearSelection'>clear selection ({{selectedStreams.length}})</md-button>
        </div>
      </md-card-content>
    </md-card>
    <!--     <md-card class="md-layout-item md-size-100 md-elevation-0">
      <md-card-content>
        <h1 class='md-display-1'>Your streams:</h1>
      </md-card-content>
    </md-card> -->
    <div class='md-layout-item md-small-size-100 md-medium-size-50 md-large-size-33 md-xlarge-size-25' v-for='stream in paginatedStreams' :key='stream._id'>
      <stream-card :stream='stream' v-on:selected='selectThis'></stream-card>
    </div>
    <div class="md-layout-item md-size-100">
      <md-card class='md-elevation-0'>
        <md-button class='md-raised btn-no-margin' @click.native='endIndex+=12' :disabled='paginatedStreams.length===filteredStreams.length'>
          Show More ({{paginatedStreams.length}} / {{filteredStreams.length}})
        </md-button>
      </md-card>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash.debounce'
import StreamCard from '../components/StreamCard.vue'

export default {
  name: '',
  components: { StreamCard },
  computed: {
    streams( ) {
      return this.$store.state.streams.filter( stream => stream.parent == null )
    },
    filteredStreams( ) {
      let base = this.streams
      if ( this.filters.length === 0 )
        return base

      this.filters.forEach( query => {
        query.key = query.key.toLowerCase( )
        switch ( query.key ) {
          case 'private':
            if ( query.value )
              base = base.filter( stream => stream.private.toString( ) === query.value )
            else
              base = base.filter( stream => stream.private === true )
            break
          case 'public':
            console.log( query )
            if ( query.value )
              base = base.filter( stream => ( !stream.private ).toString( ) === query.value )
            else
              base = base.filter( stream => stream.private === false )
            break
          case 'tag':
          case 'tags':
            let myTags = query.value.split( ',' )
            // TODO
            break
          case 'name':
            base = base.filter( stream => stream.name.toLowerCase( ).includes( query.value.toLowerCase( ) ) )
            break
          case 'streamid':
          case 'id':
            base = base.filter( stream => stream.streamId.toLowerCase( ).includes( query.value.toLowerCase( ) ) )
            break
        }
      } )
      return base


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
    }
  },
  methods: {
    updateSearch: debounce( function( e ) {
      this.searchfilter = e
      try {
        let filters = this.searchfilter.split( ' ' ).map( t => {
          if ( t.includes( ':' ) )
            return { key: t.split( ':' )[ 0 ], value: t.split( ':' )[ 1 ] }
          else if ( !t.includes( 'public' ) && !t.includes( 'private' ) )
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
      bus.$emit( 'unselect-all' )
    }
  },
  created( ) {
    this.$http.get( 'streams?omit=objects,layers&isComputedResult=false&deleted=false&sort=-lastModified' )
      .then( res => {
        this.$store.commit( 'ADD_STREAMS', res.data.resources )
      } )
      .catch( err => {
        // TODO: throw error re could not get stream
      } )
  }
}

</script>
<style scoped lang='scss'>
.md-field label {
  opacity: 0.5;
}

.main-toolbar {
  position: -webkit-sticky;
  /* Safari */
  position: sticky;
  top: 0;
  width: 100%;
  background-color: white;
  z-index: 100;
  margin-bottom: 30px;
}

.md-field {
  margin: 0 !important;
}
</style>
