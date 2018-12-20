<template>
  <div>
    <detail-description :resource='stream'></detail-description>
    <br>
    <stream-detail-user-perms :stream='stream'></stream-detail-user-perms>
    <br>
    <stream-detail-network :stream='stream'></stream-detail-network>
    <br>
    <stream-detail-comments :stream='stream'></stream-detail-comments>
    <br>
    <stream-detail-history :stream='stream'></stream-detail-history>
  </div>
</template>
<script>
import debounce from 'lodash.debounce'
import union from 'lodash.union'

import StreamDetailTitle from '../components/StreamDetailTitle.vue'
import DetailDescription from '../components/DetailDescription.vue'
import StreamDetailUserPerms from '../components/StreamDetailUserPerms.vue'
import StreamDetailNetwork from '../components/StreamDetailNetwork.vue'
import StreamDetailHistory from '../components/StreamDetailHistory.vue'
import StreamDetailComments from '../components/StreamDetailComments.vue'

export default {
  name: 'StreamDetailView',
  components: {
    StreamDetailTitle,
    DetailDescription,
    StreamDetailUserPerms,
    StreamDetailNetwork,
    StreamDetailHistory,
    StreamDetailComments
  },
  computed: {
    stream( ) {
      let stream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
      return stream
    },
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    }
  },
  data( ) {
    return {
      error: '',
      editDescription: false
    }
  },
  methods: {
    restore( ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, deleted: false } )
    },
  },
  mounted( ) {
    let stream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
    if ( !stream ) {
      this.$store.dispatch( 'getStream', { streamId: this.$route.params.streamId } )
        .then( res => {
          this.$store.dispatch( 'getUser', { _id: res.data.resource.owner } )
          union( res.data.resource.canRead, res.data.resource.canWrite ).forEach( _id => this.$store.dispatch( 'getUser', { _id: _id } ) )
        } )
        .catch( err => {
          if ( err.message.includes( '404' ) ) this.error = `Stream ${this.$route.params.streamId} was not found.`
          if ( err.message.includes( '401' ) ) this.error = `Stream ${this.$route.params.streamId} is not accessible to you due to its protection level.`
        } )
    } else {
      this.$store.dispatch( 'getUser', { _id: stream.owner } )
      union( stream.canRead, stream.canWrite ).forEach( _id => this.$store.dispatch( 'getUser', { _id: _id } ) )
    }
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

a:hover {
  cursor: pointer;
}

</style>
