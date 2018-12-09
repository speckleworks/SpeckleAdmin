import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

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
    comments: [ ],
    users: [ ]
  },
  mutations: {
    ADD_STREAMS( state, streams ) {
      streams.forEach( stream => {
        if ( state.streams.findIndex( x => x.streamId === stream.streamId ) === -1 ) {
          // defensive code (vue 3.0 we're off to typescript baby, can't wait)
          if ( !stream.description ) stream.description = '...'
          if ( !stream.tags ) stream.tags = [ ]
          state.streams.unshift( stream )
        }
      } )
    },
    UPDATE_STREAM( state, props ) {
      let found = state.streams.find( s => s.streamId === props.streamId )
      Object.keys( props ).forEach( key => {
        found[ key ] = props[ key ]
      } )
    },
    REMOVE_STREAM( state, stream ) {
      //  TOODO
    },
    ADD_USER( state, user ) {
      let found = state.users.find( u => u._id === user._id )
      if ( !found )
        state.users.unshift( user )
      else found = user // update the user
    },
    ADD_USERS( state, users ) {
      users.forEach( user => {
        let found = state.users.find( u => u._id === user._id )
        if ( !found )
          state.users.unshift( user )
        else found = user // update the user
      } )
    },
    SET_TOKEN( state, token ) {
      state.token = token
      state.isAuth = true
    },
    SET_USER( state, user ) {
      state.user = user
    },
    FLUSH_ALL( state ) {
      state.token = null
      state.user = {}
      state.streams = [ ]
      state.projects = [ ]
      state.users = [ ]
      state.comments = [ ]
      state.isAuth = false
    }
  },
  actions: {
    getStream( context, props ) {
      return new Promise( ( resolve, reject ) => {
        let found = context.state.streams.find( s => s.streamId === props.streamId )
        if ( found ) return resolve( found )
        Axios.get( `/streams/${props.streamId}?omit=objects` )
          .then( res => {
            context.commit( 'ADD_STREAMS', [ res.data.resource ] )
            return resolve( res )
          } )
          .catch( err => {
            return reject( err )
          } )
      } )
    },
    updateStream( context, props ) {
      Axios.put( `/streams/${props.streamId}`, props )
        .then( res => {
          context.commit( 'UPDATE_STREAM', props )
        } )
        .catch( err => {
          console.warn( err )
        } )
    },
    deleteStream( context, payload ) {},

    getUser( context, payload ) {
      return new Promise( ( resolve, reject ) => {
        let found = context.state.users.find( u => u._id === payload._id )
        if ( found ) return resolve( found )
        Axios.get( `accounts/${payload._id}` )
          .then( res => {
            if(context.state.user._id === payload._id ) res.data.resource.surname += ' (that is you!)'
            context.commit( 'ADD_USER', res.data.resource )
            return resolve( res.data.resource )
          } )
          .catch( err => {
            return reject( err )
          } )
      } )
    },

    // Auth
    login( context, payload ) {
      return new Promise( ( resolve, reject ) => {
        Axios.post( 'accounts/login', { email: payload.email, password: payload.password } )
          .then( res => {
            context.commit( 'SET_TOKEN', res.data.resource.token )
            context.commit( 'SET_USER', res.data.resource )
            // save them for later
            localStorage.setItem( 'token', res.data.resource.token )
            Axios.defaults.headers.common[ 'Authorization' ] = res.data.resource.token
            return resolve( res.data.resource )
          } )
          .catch( err => {
            return reject( err )
          } )
      } )
    },
    logout( context, payload ) {
      context.commit( 'FLUSH_ALL' )
      localStorage.removeItem( 'token' )
      Axios.defaults.headers.common[ 'Authorization' ] = ''
    }
  }
} )
