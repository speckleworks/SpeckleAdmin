import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

import CatFacts from './catfacts.js'

Vue.use( Vuex )

export default new Vuex.Store( {
  state: {
    facts: CatFacts.facts,
    user: {
      name: "Not initialised...",
      surname: "Not initialised...",
      company: "Not initialised...",
      email: "Not initialised..."
    },
    otherUsers: [ ],
    server: null,
    auth: false,
    token: null,
    streams: [ ],
    appMessages: [ 'Welcome!' ]
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
            context.commit( 'setCredentials', { token: res.data.resource.token, auth: true } )
            window.localStorage.setItem( 'token', res.data.resource.token )
            return Axios.get( this.state.server + '/accounts', { headers: { Authorization: res.data.resource.token } } )
          } )
          .then( res => {
            context.commit( 'setUser', res.data.resource )
            window._adminBus.$emit( 'message', `Registration ok! Welcome ${res.data.resource.name}!` )
            resolve( )
          } )
          .catch( err => {
            window._adminBus.$emit( 'message', "Failed to register. Maybe you've used this email before?" )
            reject( "Failed to register. Maybe you've used this email before?" )
          } )
      } )
    },
    login( context, credentials ) {
      return new Promise( ( resolve, reject ) => {
        Axios.post( this.state.server + '/accounts/login', { email: credentials.email, password: credentials.password } )
          .then( res => {
            if ( !res.data.success ) return reject( res.data.message )
            context.commit( 'setCredentials', { token: res.data.resource.token, auth: true } )
            window.localStorage.setItem( 'token', res.data.resource.token )
            return Axios.get( this.state.server + '/accounts', { headers: { Authorization: res.data.resource.token } } )
          } )
          .then( res => {
            context.commit( 'setUser', res.data.resource )
            window._adminBus.$emit( 'message', `Login ok! Welcome ${res.data.user.name}!` )
            resolve( )
          } )
          .catch( err => {
            window._adminBus.$emit( 'message', "Failed to authenticate." )
            reject( "Failed to authenticate." )
          } )
      } )
    },
    getStreams( context ) {
      return new Promise( ( resolve, reject ) => {
        context.commit( 'addStreamsBulk', [ ] )
        Axios.get( this.state.server + '/streams?populatePermissions=true', { headers: { Authorization: this.state.token } } )
          .then( res => {
            context.commit( 'addStreamsBulk', [ ...res.data.resources ] )
            window._adminBus.$emit( 'message', `Here are your streams, ${this.state.user.name}!` )
            resolve( )
          } )
          .catch( err => {
            window._adminBus.$emit( 'message', "Failed to get streams." )
            reject( err )
          } )
      } )
    },
    patchStream( context, payload ) {
      return new Promise( ( resolve, reject ) => {
        Axios.put( this.state.server + '/streams/' + payload.streamId, payload.data, { headers: { Authorization: this.state.token } } )
          .then( res => {
            context.commit( 'patchStream', payload )
            window._adminBus.$emit( 'message', "Stream edited." )
            resolve( res.data )
          } )
          .catch( err => {
            window._adminBus.$emit( 'message', "Failed to edit stream: " + err.message )
            reject( err )
          } )

      } )
    },
    deleteStream( context, payload ) {
      return new Promise( ( resolve, reject ) => {
        Axios.delete( this.state.server + '/streams/' + payload.streamId, { headers: { Authorization: this.state.token } } )
          .then( res => {
            context.commit( 'deleteStream', payload )
            window._adminBus.$emit( 'message', "Stream deleted." )
            resolve( res.data )
          } )
          .catch( err => {
            window._adminBus.$emit( 'message', "Failed to delete stream." )
            reject( err )
          } )
      } )
    },
    patchUser( context, payload ) {
      return new Promise( ( resolve, reject ) => {
        Axios.put( this.state.server + '/accounts', { ...payload.data }, { headers: { Authorization: this.state.token } } )
          .then( res => {
            context.commit( 'patchUser', payload )
            window._adminBus.$emit( 'message', "Edit successful." )
            resolve( res.data )
          } )
          .catch( err => {
            window._adminBus.$emit( 'message', "Failed to edit profile." )
            reject( err )
          } )
      } )
    }
  },
  mutations: {
    patchStream( state, payload ) {
      let stream = state.streams.find( stream => stream.streamId === payload.streamId )
      for ( var key in payload.data )
        if ( stream.hasOwnProperty( key ) ) stream[ key ] = payload.data[ key ]
    },
    patchUser( state, payload ) {
      for ( var key in payload.data ) {
        if ( state.user.hasOwnProperty( key ) ) state.user[ key ] = payload.data[ key ]
      }
    },
    setCredentials( state, payload ) {
      state.auth = payload.auth
      state.token = payload.token
    },
    setUser( state, user ) {
      if ( !user.company || user.company == ' ' ) user.company = 'not specified'
      state.user = user
    },
    setPermAgg( state, payload ) {
      let stream = state.streams.find( str => str.streamId === payload.streamId )
      stream.userPermissions = payload.permAgg
    },
    addStreamsBulk( state, streams ) {
      state.streams = streams
      // prep streams
      state.streams.forEach( stream => {
        stream.isOwner = state.user._id == stream.owner
        stream.selected = false
        if ( !stream.isOwner ) return
        stream.userPermissions = [ ]
        stream.canRead.forEach( usr => {
          usr.canRead = true;
          usr.canWrite = false;
        } )
        stream.canWrite.forEach( usr => {
          usr.canWrite = true;
          usr.canRead = true;
        } )

        stream.userPermissions = [ ...stream.canWrite, ...stream.canRead.filter( user => { return stream.canWrite.find( u => u.email == user.email ) ? false : true } ) ]

        stream.canRead = stream.canRead.map( usr => usr._id )
        stream.canWrite = stream.canWrite.map( usr => usr._id )

        stream.isClone = stream.parent == null ? false : true

      } )
    },
    deleteStream( state, payload ) {
      state.streams.splice( state.streams.indexOf( payload ), 1 )
    }
  }
} )
