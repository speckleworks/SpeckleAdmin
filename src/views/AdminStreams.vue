<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-data-table
        :items='streams'
      >
      <template v-slot:items="props">
        <tr :active="props.selected" @click="props.selected = !props.selected">
          <td>
            <v-checkbox
              :input-value="props.selected"
              primary
              hide-details
            ></v-checkbox>
          </td>
          <td>{{ props.item.name }}</td>
          <td class="text-xs-right">{{ props.item.streamId }}</td>
          <td class="text-xs-right">{{ props.item.owner }}</td>
          <td class="text-xs-right">{{ props.item.private }}</td>
        </tr>
      </template>
      </v-data-table>
    </v-flex>
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
  name: 'AdminStreamsView',
  components: {
  },
  watch: {
  },
  computed: {
  },
  data( ) {
    return {
      streams: [],
      isGettingStreamData: false
    }
  },
  methods: {
    fetchData() {
      console.log( 'fetching a list of streams' )
      this.isGettingStreamData = true
      Axios.get( 'streams/all' )
        .then( res => {
          this.streams = res.data.resources
          this.isGettingStreamData = false
        } )
        .catch( err => {
          this.isGettingStreamData = false
          // TODO: Handle error
          console.error( err )
        } )
    },
  },
  mounted( ) {
    this.fetchData()
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
