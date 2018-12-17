<template>
  <div>
    <div class='md-layout md-alignment-center-center' v-if='stream'>
      <div class="md-layout-item md-size-100 text-center sticky-top" v-if='stream.deleted'>
        <md-content class='md-accent md-caption  md-layout md-alignment-center-center' style='width:100%;padding:10px; border-radius: 2px;'>
          <div class='md-layout-item'>This stream is in your trashbin.</div>
          <div class='md-layout-item'>
            <md-button class='md-dense md-raised' v-if='canEdit' @click.native='restore'> Restore? </md-button>
          </div>
        </md-content>
      </div>
      <div class="md-layout-item md-size-100">
        <div class='md-layout md-alignment-center-center'>
          <div class="md-layout-item md-size-50 md-large-size-65 md-medium-size-100">
            <stream-detail-title :stream='stream'></stream-detail-title>
            <!-- </div>
          <div class="md-layout-item md-size-50 md-medium-size-100 detail-card"> -->
            <detail-description :resource='stream'></detail-description>
            <!-- </div>
          <div class="md-layout-item md-size-50 md-medium-size-100 detail-card" v-show='true'> -->
            <br>
            <stream-detail-user-perms :stream='stream'></stream-detail-user-perms>
            <!-- </div>
          <div class="md-layout-item md-size-50 md-medium-size-100 detail-card"> -->
            <br>
            <stream-detail-network :stream='stream'></stream-detail-network>
            <!-- </div>
          <div class="md-layout-item md-size-50 md-medium-size-100 detail-card"> -->
            <br>
            <stream-detail-comments :stream='stream'></stream-detail-comments>
            <!-- </div>
          <div class="md-layout-item md-size-50 md-medium-size-100 detail-card"> -->
            <br>
            <stream-detail-history :stream='stream'></stream-detail-history>
          </div>
        </div>
      </div>
    </div>
    <div class='md-layout md-alignment-center-center' style="height: 95vh" v-else>
      <div class='md-layout-item md-size-50'>
        <md-progress-bar md-mode="indeterminate"></md-progress-bar>
      </div>
    </div>
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
