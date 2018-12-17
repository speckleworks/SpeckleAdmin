import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'

import uniq from 'lodash.uniq'

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
    clients: [ ],
    projects: [ ],
    comments: [ ],
    users: [ ]
  },
  getters: {
    streamClients: ( state ) => ( streamId ) => {
      return state.clients.filter( c => c.streamId === streamId )
    },
    filteredStreams: ( state ) => ( filters ) => {
      let base = state.streams.filter( stream => stream.parent == null && stream.deleted === false )
      if ( !filters || filters.length === 0 ) return base
      filters.forEach( query => {
        query.key = query.key.toLowerCase( )
        switch ( query.key ) {
          case 'private':
            if ( query.value )
              base = base.filter( stream => stream.private.toString( ) === query.value )
            else
              base = base.filter( stream => stream.private === true )
            break
          case 'public':
            if ( query.value )
              base = base.filter( stream => ( !stream.private ).toString( ) === query.value )
            else
              base = base.filter( stream => stream.private === false )
            break
          case 'tag':
          case 'tags':
            let myTags = query.value.split( ',' ).map( t => t.toLowerCase( ) )
            base = base.filter( stream => {
              let streamTags = stream.tags.map( t => t.toLowerCase( ) )
              return myTags.every( t => streamTags.includes( t ) )
            } )
            break
          case 'mine':
            base = base.filter( stream => stream.owner === state.user._id )
            break;
          case 'shared':
            base = base.filter( stream => stream.owner !== state.user._id )
            break;
          case 'name':
            base = base.filter( stream => stream.name.toLowerCase( ).includes( query.value.toLowerCase( ) ) )
            break
          case 'streamid':
          case 'id':
            base = base.filter( stream => stream.streamId.toLowerCase( ).includes( query.value.toLowerCase( ) ) )
            break
        }
      } )
      return base
    }
  },
  mutations: {
    // Streams
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
    DELETE_STREAM( state, stream ) {
      let index = state.streams.findIndex( s => s.streamId === stream.streamId )
      if ( index > -1 ) {
        state.streams.splice( index, 1 )
      } else
        console.log( `Failed to remove stream ${stream.streamId} from store.` )
    },

    // Clients
    ADD_CLIENTS( state, clients ) {
      clients.forEach( client => {
        if ( state.clients.findIndex( x => x._id === client._id ) === -1 ) {
          state.clients.push( client )
        }
      } )
    },

    // Projects
    ADD_PROJECTS( state, projects ) {
      projects.forEach( project => {
        if ( state.projects.findIndex( p => p._id === project._id ) === -1 ) {
          // potentially enforce here extra fields
          if ( !project.tags ) project.tags = [ ]
          if ( !project.deleted ) project.deleted = false
          state.projects.unshift( project )
        }
      } )
    },
    UPDATE_PROJECT( state, props ) {
      let found = state.projects.find( p => p._id === props._id )
      Object.keys( props ).forEach( key => {
        found[ key ] = props[ key ]
      } )
    },
    DELETE_PROJECT( state, props ) {
      let index = state.projects.findIndex( p => p._id === props._id )
      if ( index > -1 ) {
        state.projects.splice( index, 1 )
      } else
        console.log( `Failed to remove project ${props._id} from store.` )
    },

    // Users
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
    SET_SERVER( state, server ) {
      state.server = server
    },
    SET_SERVER_DETAILS( state, serverManifest ) {
      state.serverManifest = serverManifest
    },
    SET_TOKEN( state, token ) {
      state.token = token
      state.isAuth = true
    },
    SET_USER( state, user ) {
      state.user = user
    },
    // End of life
    FLUSH_ALL( state ) {
      state.token = null
      state.user = {}
      state.streams = [ ]
      state.projects = [ ]
      state.clients = [ ]
      state.users = [ ]
      state.comments = [ ]
      state.isAuth = false
    }
  },
  actions: {
    // Streams
    getStream( context, props ) {
      return new Promise( ( resolve, reject ) => {
        let found = context.state.streams.find( s => s.streamId === props.streamId )
        if ( found ) return resolve( found )
        Axios.get( `streams/${props.streamId}?omit=objects` )
          .then( res => {
            context.commit( 'ADD_STREAMS', [ res.data.resource ] )
            return resolve( res )
          } )
          .catch( err => {
            return reject( err )
          } )
      } )
    },
    getStreams( context, query ) {
      return new Promise( ( resolve, reject ) => {
        Axios.get( `streams?${query ? query : '' }` )
          .then( res => {
            context.commit( 'ADD_STREAMS', res.data.resources )
            return resolve( res.data.resources )
          } )
          .catch( err => {
            console.log( err )
            return reject( err )
          } )
      } )
    },
    updateStream( context, props ) {
      Axios.put( `streams/${props.streamId}`, props )
        .then( res => {
          context.commit( 'UPDATE_STREAM', props )
        } )
        .catch( err => {
          console.warn( err )
        } )
    },
    // streamAddWriteUser( context, props ) {
    //   return new Promise( ( resolve, reject ) => {
    //     let stream = context.state.streams.find( s => s.streamId === props.streamId )
    //     if ( !found ) return reject( new Error( 'Failed to find stream in store.' ) )
    //     stream.canWrite = uniq( [ ...stream.canWrite, props.userId ] )
    //     dispatch( 'updateStream', { streamId: props.streamId, canWrite: stream.canWrite } )
    //   } )
    // },
    getStreamClients( context, props ) {
      Axios.get( `streams/${props.streamId}/clients` )
        .then( res => {
          context.commit( 'ADD_CLIENTS', res.data.resources )
        } )
        .catch( err => {
          console.log( err )
        } )
    },
    deleteStream( context, payload ) {
      Axios.delete( `streams/${payload.streamId}` )
        .then( res => {
          context.commit( 'DELETE_STREAM', { streamId: payload.streamId } )
        } )
        .catch( err => {
          console.log( err )
        } )
    },

    // projects
    getProject( context, props ) {
      return new Promise( ( resolve, reject ) => {
        Axios.get( `projects/${props._id}` )
          .then( res => {
            context.commit( 'ADD_PROJECTS', [ res.data.resource ] )
            return resolve( res )
          } )
          .catch( err => {
            console.error( err )
            return reject( err )
          } )
      } )
    },
    getProjects( context, query ) {
      return new Promise( ( resolve, reject ) => {
        Axios.get( `projects?${query ? query : '' }` )
          .then( res => {
            context.commit( 'ADD_PROJECTS', res.data.resources )
            return resolve( res.data.resources )
          } )
          .catch( err => {
            console.log( err )
            return reject( err )
          } )
      } )
    },
    createProject( context, project ) {
      return new Promise( ( resolve, reject ) => {
        Axios.post( `projects`, project ? project : { name: 'A new speckle project' } )
          .then( res => {
            context.commit( 'ADD_PROJECTS', [ res.data.resource ] )
            return resolve( res.data.resource )
          } )
          .catch( err => {
            console.log( err )
            return reject( err )
          } )
      } )
    },
    updateProject( context, props ) {
      Axios.put( `projects/${props._id}`, props )
        .then( res => {
          context.commit( 'UPDATE_PROJECT', props )
        } )
        .catch( err => {
          console.warn( err )
        } )
    },
    deleteProject( context, props ) {
      Axios.delete( `projects/${props._id}` )
        .then( res => {
          context.commit( 'DELETE_PROJECT', { _id: props._id } )
        } )
        .catch( err => {
          console.warn( err )
        } )
    },

    // users
    getUser( context, payload ) {
      return new Promise( ( resolve, reject ) => {
        let found = context.state.users.find( u => u._id === payload._id )
        if ( found ) return resolve( found )
        Axios.get( `accounts/${payload._id}` )
          .then( res => {
            if ( context.state.user._id === payload._id ) res.data.resource.surname += ' (that is you!)'
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
