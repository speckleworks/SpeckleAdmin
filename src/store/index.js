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
  getters: {
    streamById: ( state ) => ( streamId ) => {
      return state.streams.find( stream => stream.streamId === streamId )
    }
  },
  actions: {
    register( context, credentials ) {
      return new Promise( ( resolve, reject ) => {
        Axios.post( this.state.server + '/accounts/register', { email: credentials.email, password: credentials.password, name: credentials.name, surname: credentials.surname, company: credentials.company } )
          .then( res => {
            if ( !res.data.success ) return reject( res.data.message )
            context.commit( 'setCredentials', { token: res.data.token, auth: true } )
            window.localStorage.setItem( 'token', res.data.token )
            return Axios.get( this.state.server + '/accounts/profile', { headers: { Authorization: res.data.token } } )
          } )
          .then( res => {
            context.commit( 'setUser', res.data.user )
            resolve( )
          } )
          .catch( err => {
            reject( "Failed to register. Maybe you've used this email before?" )
          } )
      } )
    },
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
            context.commit( 'setUser', res.data.user )
            resolve( )
          } )
          .catch( err => {
            reject( "Failed to authenticate." )
          } )
      } )
    },
    getStreams( context ) {
      return new Promise( ( resolve, reject ) => {
        Axios.get( this.state.server + '/accounts/streams', { headers: { Authorization: this.state.token } } )
          .then( res => {
            console.log( res )
            context.commit( 'addStreamsBulk', res.data.streams )
            resolve( )
          } )
          .catch( err => {
            reject( err )
          } )
      } )
    },
    setStreamPrivate( context, payload ) {
      return new Promise( ( resolve, reject ) => {
        Axios.patch( this.state.server + '/streams/' + payload.streamId, { private: payload.private }, { headers: { Authorization: this.state.token } } )
          .then( res => {
            context.commit( 'setStreamPrivate', payload )
            resolve( )
          } )
          .catch( err => {
            console.log( err )
            reject( )
          } )
      } )
    },
    setStreamName( context, payload ) {
      return new Promise( ( resolve, reject ) => {
        Axios.patch( this.state.server + '/streams/' + payload.streamId, { name: payload.name }, { headers: { Authorization: this.state.token } } )
          .then( res => {
            context.commit( 'setStreamName', payload )
            resolve( )
          } )
          .catch( err => {
            console.log( err )
            reject( )
          } )
      } )
    },
    setStreamArchived( context, payload ) {
      return new Promise( ( resolve, reject ) => {
        Axios.patch( this.state.server + '/streams/' + payload.streamId, { deleted: payload.deleted }, { headers: { Authorization: this.state.token } } )
          .then( res => {
            context.commit( 'setStreamArchived', payload )
            resolve( )
          } )
          .catch( err => {
            console.log( err )
            reject( )
          } )
      } )
    }
  },
  mutations: {
    setStreamArchived( state, payload ) {
      state.streams.find( stream => stream.streamId === payload.streamId ).deleted = payload.deleted
    },
    setStreamName( state, payload ) {
      state.streams.find( stream => stream.streamId === payload.streamId ).name = payload.name
    },
    setStreamPrivate( state, payload ) {
      state.streams.find( stream => stream.streamId === payload.streamId ).private = payload.private
    },
    setCredentials( state, payload ) {
      state.auth = payload.auth
      state.token = payload.token
    },
    setUser( state, user ) {
      state.user = user
    },
    addStreamsBulk( state, streams ) {
      state.streams = streams
      state.streams.forEach( stream => {
        stream.isOwner = state.user._id == stream.owner
      } )
    }
  }
} )
