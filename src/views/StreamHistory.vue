<template>
  <div>
    <md-card class='md-elevation-3' md-with-hover>
      <md-card-header class='bg-ghost-white'>
        <md-card-header-text>
          <div class="md-title">History</div>
          <!-- <div class="md-caption">Stream's previous versions.</div> -->
        </md-card-header-text>
      </md-card-header>
      <md-card-content>
        <stream-detail-history :stream='stream'></stream-detail-history>
      </md-card-content>
    </md-card>
  </div>
</template>
<script>
import debounce from 'lodash.debounce'
import union from 'lodash.union'

import StreamDetailHistory from '../components/StreamDetailHistory.vue'
export default {
  name: 'StreamEditView',
  components: {
    StreamDetailHistory
  },
  computed: {
    stream( ) {
      return this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
    },
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    }
  },
  data( ) {
    return {}
  },
  methods: {
    fetchData( ) {

    }
  },
  mounted( ) {
    console.log( 'hello data' )
    let stream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
    this.fetchData( this.$route.params.streamId )
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
