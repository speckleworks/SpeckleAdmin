import Vue from 'vue'
import Vuex from 'vuex'

Vue.use( Vuex )

export default new Vuex.Store( {
  state: {
    server: null,
    serverManifest: {
      serverName: null,
      api: null,
      version: null
    },
    token: null,
    user: {},
    isAuth: false,
    streams: [ ],
    projects: [ ],
    comments: [ ]
  },
  mutations: {
    ADD_STREAMS( state, streams ) {
      streams.forEach( stream => {
        if ( state.streams.findIndex( x => x.streamId === stream.streamId ) === -1 )
          state.streams.unshift( stream )
      } )
    },
    REMOVE_STREAM( state, stream ) {

    }
  },
  actions: {

  }
} )
