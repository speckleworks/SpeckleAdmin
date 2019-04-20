<template>
  <v-container grid-list-xl v-if='stream'>
    <v-toolbar absolute v-if='stream.deleted'>
      <span>This stream is in your trashbin. </span>
      <v-spacer></v-spacer>
      <v-btn color='primary' v-if='canEdit' @click.native='restore'> Restore? </v-btn>
    </v-toolbar>
    <v-layout row wrap>
      <v-flex xs12>
        <stream-detail-title :stream='stream'></stream-detail-title>
      </v-flex>
      <v-flex xs12>
        <v-tabs v-model="active" grow class='pa-0 ma-0'>
          <v-tab key="Overview" ripple :to='{name:"stream overview"}'>
            Overview
          </v-tab>
          <v-tab key="Sharing" ripple :to='{name:"stream sharing"}'>
            Sharing
          </v-tab>
          <v-tab key="History" ripple :to='{name:"stream history"}'>
            History
          </v-tab>
          <v-tab key="Data" ripple :to='{name:"stream data"}'>
            Data
          </v-tab>
        </v-tabs>
      </v-flex>
    </v-layout>
    <!-- Where the sub routes live -->
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
<!--     <div class='md-layout md-alignment-center-center'>
      <div class='md-layout-item md-size-50'>
        <md-progress-bar md-mode="indeterminate"></md-progress-bar>
      </div>
    </div> -->
  </v-container>
</template>
<script>
import debounce from 'lodash.debounce'
import union from 'lodash.union'

import StreamDetailTitle from '../components/StreamDetailTitle.vue'
import DetailDescription from '../components/DetailDescription.vue'
import StreamDetailUserPerms from '../components/StreamDetailUserPerms.vue'
import StreamDetailNetwork from '../components/StreamDetailNetwork.vue'
import StreamDetailComments from '../components/StreamDetailComments.vue'

export default {
  name: 'StreamDetailView',
  components: {
    StreamDetailTitle,
    DetailDescription,
    StreamDetailUserPerms,
    StreamDetailNetwork,
    StreamDetailComments
  },
  watch: {
    stream( ) {
      this.fetchData( )
    }
  },
  computed: {
    stream( ) {
      let stream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
      if ( stream === null ) {
        console.log( 'null fukcing stream' )
      }
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
      editDescription: false,
      active: null
    }
  },
  methods: {
    getEndRoute( ) {
      let ending = this.$route.path.split( '/' ).reverse( )[ 0 ]
      if ( ending === this.$route.params.streamId || ending === '' ) return 'overview'
      else return ending
    },
    restore( ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, deleted: false } )
    },
    fetchData( ) {
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
  },
  mounted( ) {
    this.fetchData( )
  }
}

</script>
<style scoped lang='scss'>
.link-button {
  width: 100%;
  height: 60px;
  border-bottom: 2px solid white;
  transition: all .3s ease;
  margin: 0;
}

.link-button.is-active {
  border-bottom: 2px solid #448aff;
  color: #448aff !important;
  background-color: ghostwhite;
}

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
