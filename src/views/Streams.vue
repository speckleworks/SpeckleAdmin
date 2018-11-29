<template>
  <div class='md-layout'>
    <md-card class="md-primary main-toolbar md-elevation-10">
      <md-card-content class='md-layout md-alignment-center-space-between'>
        <div class="md-layout-item md-size-30">
          <md-field md-clearable md-theme='dark'>
            <md-icon>search</md-icon>
            <label>Search streams...</label>
            <md-input v-model="searchfilter"></md-input>
          </md-field>
        </div>
        <div class="md-layout-item md-size-50" v-if='selectedStreams.length > 0' style="text-align: right">
          <md-button class='md-raised md-dense md-accent'>delete</md-button>
          <md-button class='md-raised md-dense'>Make Private</md-button>
          <md-button class='md-raised md-dense' v-if='selectedStreams.length > 1'>Create Project</md-button>
          <md-button class='md-raised md-dense' @click.native='clearSelection'>clear selection ({{selectedStreams.length}})</md-button>
        </div>
      </md-card-content>
    </md-card>
    <div class='md-layout-item md-size-25 md-small-size-100' v-for='stream in paginatedStreams' :key='stream._id'>
      <stream-card :stream='stream' v-on:selected='selectThis'></stream-card>
    </div>
    <div class="md-layout-item md-size-100">
      <md-card class='md-elevation-0'>
        <md-button class='md-raised btn-no-margin' @click.native='endIndex+=12'>
          Load More
        </md-button>
      </md-card>
    </div>
  </div>
</template>
<script>
import StreamCard from '../components/StreamCard.vue'
export default {
  name: '',
  components: { StreamCard },
  computed: {
    streams( ) {
      return this.$store.state.streams.filter( stream => stream.parent == null )
    },
    filteredStreams( ) {
      if ( this.searchfilter !== '' )
        return this.streams.filter( stream => stream.name.toLowerCase( ).includes( this.searchfilter.toLowerCase( ) ) || stream.streamId.toLowerCase( ).includes( this.searchfilter.toLowerCase( ) ) )
      else return this.streams
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
      searchfilter: ''
    }
  },
  methods: {
    selectThis( stream ) {
      let index = this.selectedStreams.findIndex( s => s.streamId === stream.streamId )
      if ( index === -1 )
        this.selectedStreams.unshift( stream )
      else
        this.selectedStreams.splice( index, 1 )
    },
    clearSelection( ) {
      // this.selectedStreams = []
      bus.$emit( 'unselect-all' )
    }
  },
  created( ) {
    this.$http.get( 'streams?omit=objects,layers&isComputedResult=false&deleted=false&sort=-lastModified' )
      .then( res => {
        this.$store.commit( 'ADD_STREAMS', res.data.resources )
      } )
      .catch( err => {

      } )
  }
}

</script>
<style scoped lang='scss'>
.main-toolbar {
  position: -webkit-sticky;
  /* Safari */
  position: sticky;
  top: 0;
  width: 100%;
  background-color: white;
  z-index: 100;
  /*padding: 10px;*/
  margin-bottom: 30px;
}

.md-field {
  margin: 0 !important;
}

input {
  color: white;
}

</style>
