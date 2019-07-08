<template>
  <v-layout row wrap>
    <v-flex xs12>
      <div> a table of projects goes here</div>
    </v-flex>
    <!-- <v-flex xs12>
      <v-progress-linear :indeterminate="true" v-if='isGettingStreamData'></v-progress-linear>
    </v-flex> -->
  </v-layout>
</template>
<script>
import debounce from 'lodash.debounce'
import union from 'lodash.union'
import Axios from 'axios'
import uuid from 'uuid/v4'
import papa from 'papaparse'

import StreamLayer from '../components/StreamLayer.vue'

export default {
  name: 'AdminProjectsView',
  components: {
  },
  watch: {
  },
  computed: {
  },
  data( ) {
    return {
    }
  },
  methods: {
    fetchData( streamId ) {
      if(!this.onlineEditable) return
      console.log( `fetching data for ${streamId}` )
      this.isGettingStreamData = true
      Axios.get( `streams/${streamId}?fields=layers` )
        .then( res => {
          this.layers = res.data.resource.layers
          console.log( this.layers )
          return Axios.get( `streams/${streamId}/objects?fields=type,value` )
        } )
        .then( res => {
          this.objects = res.data.resources
          this.$store.commit( 'ADD_DE_STREAM', { streamId: streamId, layers: this.layers, objects: this.objects } )
          this.isGettingStreamData = false

          console.log( res )
        } )
        .catch( err => {
          this.isGettingStreamData = false
          // TODO: Handle error
          console.error( err )
        } )
    },
  },
  mounted( ) {
  }
}

</script>
<style scoped lang='scss'>
.detail-card {
  margin-bottom: 20px;
}

.md-content {
  padding: 30px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.md-card-content {
  padding: 0;
}

a:hover {
  cursor: pointer;
}

</style>
