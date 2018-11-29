<template>
  <div class='md-layout'>
    <md-card class="md-primary main-toolbar md-elevation-10">
      <h3 class="md-title">Streams</h3>
    </md-card>

    <div class='md-layout-item md-size-25 md-small-size-100' v-for='stream in paginatedStreams' :key='stream._id'>
      <stream-card :stream='stream'></stream-card>
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
      return this.streams
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
    }
  },
  methods: {},
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
  width:100%;
  background-color: white;
  z-index: 100;
  padding:10px;
}

</style>
