import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

Vue.use( Vuex )

export default new Vuex.Store( {
  state: {
    user: {},
    server: null,
    auth: false,
    token: null,
    streams: [ ]
  },
  getters: {},
  actions: {
    login( context, credentials ) {
      return new Promise( ( resolve, reject ) => {
        Axios.post( this.state.server + '/accounts/login', { email: credentials.email, password: credentials.password } )
          .then( res => {
            if ( !res.data.success ) return reject( res.data.message )
            context.commit( 'setCredentials', { token: res.data.token, auth: true } )
            window.localStorage.setItem( 'token', res.data.token )
            return Axios.get( this.state.server + '/accounts/profile', { headers: { Authorization: res.data.token } } )
          } )
          .then( res => {
            console.log( res.data.user )
            context.commit( 'setUser', res.data.user )
            resolve( )
          } )
          .catch( err => {
            reject( "Failed to authenticate." )
          } )
      } )
    },
    getStreams( context ) {
      Axios.get( this.state.server + '/accounts/streams', { headers: { Authorization: this.state.token } } )
        .then( res => {
          console.log( res )
          context.commit( 'addStreamsBulk', res.data.streams.reverse() )
        } )
        .catch( err => {

        } )
    },
    setStreamPrivate( context, state ) {
      console.log("YOLO")
    },
    setStreamName( context, state ) {

    },
    setStreamDeleted( context, state ) {

    }
  },
  mutations: {
    setCredentials( state, payload ) {
      state.auth = payload.auth
      state.token = payload.token
    },
    setUser( state, user ) {
      state.user = user
    },
    addStreamsBulk( state, streams ) {
      state.streams = streams
    }
  }
} )
