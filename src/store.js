import Vue from 'vue'
import Vuex from 'vuex'
import Axios from 'axios'
import * as Msal from 'msal'

import uniq from 'lodash.uniq'
import uuid from 'uuid/v4'
import flatten from 'flat'

import { LambdaSettings } from './lambda/_lambdaSettings.js'

Vue.use( Vuex )

function removeArraysRecursive( foo ) {
  let bar = {}

  for ( let key in foo ) {
    if ( !foo.hasOwnProperty( key ) ) continue
    else if ( Array.isArray( foo[ key ] ) ) {
      //bar[ key + ' (array)' ] = `Array with ${ foo[key].length } elements`
    } else if ( typeof foo[ key ] === 'object' && foo[ key ] !== null ) {
      bar[ key ] = removeArraysRecursive( foo[ key ] )
    } else {
      bar[ key ] = foo[ key ]
    }
  }
  return bar
}

function getStructuralArrPropKeys( foo ) {
  let bar = {}

  for ( let key in foo ) {
    if ( !foo.hasOwnProperty( key ) ) continue
    else if ( Array.isArray( foo[ key ] ) ) {
      bar[ key ] = `Array with ${ foo[key].length } elements`
    } else if ( typeof foo[ key ] === 'object' && foo[ key ] !== null ) {
      bar[ key ] = getStructuralArrPropKeys( foo[ key ] )
    }
  }
  return bar
}

async function getTokenMSAL ( { clientId, authority, loginRequest } ) {
  // TODO: THIS CANNOT BE CALLED MULTIPLE TIMES!!!
  // DEPENDS ON LOCAL STORAGE TO PROPERLY OBTAIN CLIENTID
  var userAgent = new Msal.UserAgentApplication({
    auth: {
      clientId: clientId,
      authority: authority,
      redirectUri: window.location.origin + "/msal.html"
    },
    cache: {
      cacheLocation: "localStorage",
      storeAuthStateInCookie: true
    },
  })

  var token = await userAgent.getCachedToken(clientId)

  if (token)
    return token.accessToken

  try
  {
    token = await userAgent.acquireTokenSilent(loginRequest)
  }
  catch (e)
  {
    console.log('MSAL Error: ' + e.errorCode)
    if (e.errorCode === "user_login_error")
    {
      window.localStorage.msalClientId = clientId
      await userAgent.loginPopup(loginRequest)
      delete window.localStorage.msalClientId
      return await getTokenMSAL( {clientId: clientId, authority: authority, loginRequest: loginRequest})
    }
    else if (e.errorCode === "token_renewal_error")
    {
      window.localStorage.msalClientId = clientId
      token = await userAgent.acquireTokenPopup(loginRequest)
      delete window.localStorage.msalClientId
    }
  }
  
  return token.accessToken
}

export default new Vuex.Store( {
  state: {
    // The canonical and correct server url, i.e. `https://speckle.server.com/api`
    server: null,
    // The server description
    serverManifest: null,
    token: null,
    user: {},
    isAuth: false,
    // where all the streams and their properties are stored.
    streams: [ ],
    // data editable streams; we store objects and layers in here. rest of metadata
    // is in streams proper array (see above).
    deStreams: [ ],
    // global store for stream clients.
    clients: [ ],
    // global store for projects
    projects: [ ],
    comments: [ ],
    // global store for users. it's dynamically assembled as the end-user moves through
    // the admin ui, and new user profiles need to be requested.
    users: [ ],
    // viewer/processor related
    loadedStreamIds: [ ],
    objects: [ ],
    legend: null,
    selectedObjects: [ ],
    // client (used for ws requests, etc.)
    myClient: null,
    // app dark mode?
    dark: false,
    // toggles viewer controls
    viewerControls: true,

    // processor related
    // these are the function names for each block from /src/lambda
    // if you want to add your own lambda, add the function/file name to the list to expose it
    lambdas: [ ],
    processors: [ ],
    tokens: { },
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
        if ( query.value === null ) base = base
        else {
          base = base.filter( stream => stream.name !== '' )
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
              base = base.filter( stream => stream.name ? stream.name.toLowerCase( ).includes( query.value.toLowerCase( ) ) : true )
              break
            case 'streamid':
            case 'id':
              base = base.filter( stream => stream.streamId.toLowerCase( ).includes( query.value.toLowerCase( ) ) )
              break
          }
        }
      } )
      return base
    },
    objectPropertyKeys: ( state ) => {
      let keySet = new Set( )
      let stringKeySet = new Set( )
      state.objects.forEach( obj => {
        if ( !obj.properties ) return
        let flatProps = flatten( removeArraysRecursive( obj.properties ) )
        for ( let key in flatProps ) {
          if ( key === 'hash' || key === 'id' || key.toLowerCase( ).includes( 'hash' ) || key.toLowerCase( ).includes( '_carbon' ) ) continue
          if ( key.includes( '__' ) ) continue
          keySet.add( key )
          if ( typeof flatProps[ key ] === 'string' )
            stringKeySet.add( key )
        }
      } )
      let keySets = {
        allKeys: [ ...keySet ].sort( ( a, b ) => { return a.split( '.' ).length - b.split( '.' ).length } ).sort( ( a, b ) => { return a.length - b.length } ),
        stringKeys: [ ...stringKeySet ].sort( ( a, b ) => { return a.split( '.' ).length - b.split( '.' ).length } ).sort( ( a, b ) => { return a.length - b.length } ),
      }
      return keySets
    },
    // NOTE: this assumes results from GSA
    hasStructuralProperties: ( state ) => {
      for ( let obj of state.objects ) {
        try {
          if ( obj.properties.structural.result !== null )
            return true
        } catch {}
      }
      return false
    },
    // NOTE: this assumes results from GSA
    structuralKeys: ( state ) => {
      let keys = new Set( )
      for ( let obj of state.objects ) {
        try {
          let props = flatten( getStructuralArrPropKeys( obj.properties.structural.result ) )
          for ( let key in props )
            keys.add( key )
        } catch {}
      }
      return [ ...keys ]
    }
  },
  mutations: {
    SET_DARK( state, dark ) {
      state.dark = dark
    },
    TOGGLE_VIEWER_CONTROLS( state ) {
      state.viewerControls = !state.viewerControls
    },
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
      if ( !found ) throw new Error( "could not find stream." )
      Object.keys( props ).forEach( key => {
        found[ key ] = props[ key ]
      } )
      found.updatedAt = ( new Date( ) ).toISOString( )
    },
    UPDATE_STREAM_DATA( state, props ) {
      let found = state.streams.find( s => s.streamId === props.streamId )
      if ( props.layers )
        found.layers = props.layers
      found.updatedAt = ( new Date( ) ).toISOString( )
      // console.log('TODO')
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

    ADD_DE_STREAM( state, stream ) {
      let found = state.deStreams.find( s => s.streamId === stream )
      if ( !found )
        state.deStreams.push( stream )
      else {
        found.layers = stream.layers
        found.objects = stream.objects
      }
    },
    ADD_DE_STREAM_LAYER( state, stream ) {
      console.log( stream )
      let found = state.deStreams.find( s => s.streamId === stream.streamId )
      let newLayer = {
        name: `Param group ${found.layers.length + 1}`,
        orderIndex: found.layers.length,
        startIndex: found.objects.length,
        objectCount: 0,
        topology: "0-0",
        guid: uuid( ),
      }
      found.layers.push( newLayer )
    },
    UPDATE_DE_STREAM_LAYER( state, { streamId, layer, objects } ) {
      let found = state.deStreams.find( s => s.streamId === streamId )
      let surpassed = false,
        objectCountDifference = 0

      found.layers.forEach( iterLayer => {
        if ( surpassed ) {
          iterLayer.startIndex += objectCountDifference
        } else if ( iterLayer.guid === layer.guid ) {
          iterLayer.name = layer.name
          iterLayer.topology = `0-${objects.length}`
          objectCountDifference = objects.length - iterLayer.objectCount
          found.objects.splice( iterLayer.startIndex, iterLayer.objectCount, ...objects )
          iterLayer.objectCount = objects.length
          surpassed = true
        }
      } )
    },
    REMOVE_DE_STREAM_LAYER( state, { streamId, layer } ) {
      let found = state.deStreams.find( s => s.streamId === streamId )
      // dump objects
      found.objects.splice( layer.startIndex, layer.objectCount )
      // adjust start indexes
      let surpassed = false
      found.layers.forEach( iterLayer => {
        if ( surpassed ) {
          iterLayer.startIndex -= layer.objectCount
          iterLayer.orderIndex -= 1
        } else if ( iterLayer.guid === layer.guid ) surpassed = true
      } )
      // dump layer
      found.layers = found.layers.filter( l => l.guid !== layer.guid )
    },
    APPEND_DE_STREAM_LAYERS_FROM_CSV( state, { streamId, transposed } ) {
      let found = state.deStreams.find( s => s.streamId === streamId )
      let index = 0
      for ( let arr of transposed ) {
        let newLayer = {
          name: arr[ 0 ] !== '' ? arr[ 0 ] : "Unnamed",
          orderIndex: -1, // to be set properly afterwards
          startIndex: index === 0 ? found.objects.length : found.objects.length,
          objectCount: arr.length - 1,
          topology: `0-${arr.length-1}`,
          guid: uuid( ),
        }
        found.layers.push( newLayer )
        let noHeader = arr.slice( 1, arr.length )
        console.log( noHeader )
        found.objects.push( ...noHeader.map( val => {
          if ( !val ) return { type: "Null", value: "" }
          if ( typeof val === 'boolean' )
            return { type: "Boolean", value: val }
          if ( typeof val === 'number' )
            return { type: "Number", value: val } // TODO: Hash it please
          if ( typeof val === 'string' )
            return { type: "String", value: val } // TODO: Hash it please
        } ) )
        index++
      }
      found.layers.forEach( ( layer, k ) => {
        console.log( k )
        layer.orderIndex = k
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
      found.updatedAt = ( new Date( ) ).toISOString( )
    },
    DELETE_PROJECT( state, props ) {
      let index = state.projects.findIndex( p => p._id === props._id )
      if ( index > -1 ) {
        state.projects.splice( index, 1 )
      } else
        console.log( `Failed to remove project ${props._id} from store.` )
    },

    // Processors
    ADD_LAMBDAS( state, lambdas ) {
      lambdas.forEach( lambda => {
        if ( state.lambdas.findIndex( p => p.function === lambda.function ) === -1 ) {
          state.lambdas.push( lambda )
        }
      } )
    },
    ADD_PROCESSORS( state, processors ) {
      processors.forEach( processor => {
        if ( state.processors.findIndex( p => p._id === processor._id ) === -1 ) {
          // potentially enforce here extra fields
          if ( !processor.tags ) processor.tags = [ ]
          state.processors.unshift( processor )
        }
      } )
    },
    UPDATE_PROCESSOR( state, props ) {
      let found = state.processors.find( p => p._id == props._id )

      Object.keys( props ).forEach( key => {
        found[ key ] = props[ key ]
      } )
    },
    DELETE_PROCESSOR( state, props ) {
      let index = state.processors.findIndex( p => p._id === props._id )
      if ( index > -1 ) {
        state.processors.splice( index, 1 )
      } else
        console.log( `Failed to remove processor ${props._id} from store.` )
    },
    ADD_TOKEN( state, {id, token} ) {
      Vue.set(state.tokens, id, token)
      console.log(state.tokens)
    },
    DELETE_TOKEN( state, id ) {
      Vue.delete(state.tokens, id)
      console.log(state.tokens)
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
    UPDATE_LUSER( state, user ) {
      let found = null
      if ( user._id === state.user._id ) found = state.user
      else
        found = state.users.find( u => u._id === user._id )
      if ( !found )
        return console.error( 'User not found; aborting update.' )
      Object.keys( user ).forEach( key => {
        found[ key ] = user[ key ]
      } )
    },

    // Generics
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
    SET_WEB_APP_CLIENT( state, client ) {
      state.client = client
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
    },

    // Viewer related
    ADD_LOADED_STREAMID( state, streamId ) {
      state.loadedStreamIds = [ ...new Set( [ ...state.loadedStreamIds, streamId ] ) ]
    },
    REMOVE_LOADED_STREAMID( state, streamId ) {
      let index = state.loadedStreamIds.indexOf( streamId )
      if ( index !== -1 )
        state.loadedStreamIds.splice( index, 1 )
      else
        console.warn( `Failed to remove loaded streamid: ${streamId} from ${state.loadedStreamIds}` )
    },
    // OBJECTS
    ADD_OBJECTS( state, objects ) {
      state.objects.push( ...objects )
    },
    UPDATE_OBJECTS_STREAMS( state, { objIds, streamToAdd, streamToRemove } ) {
      objIds.forEach( id => {
        let myObject = state.objects.find( o => o._id === id )
        if ( myObject ) {
          if ( streamToAdd && myObject.streams.indexOf( streamToAdd ) === -1 )
            myObject.streams.push( streamToAdd )
          if ( streamToRemove ) {
            let index = myObject.streams.indexOf( streamToRemove )
            if ( index !== -1 ) myObject.streams.splice( index, 1 )
          }
        }
      } )
    },
    REMOVE_OBJECTS( state, objectIds ) {
      state.objects = state.objects.filter( obj => objectIds.indexOf( obj._id ) === -1 )
    },
    // Selected objects setters
    SET_SELECTED_OBJECTS( state, { objectIds } ) {
      if ( objectIds.length > 0 )
        state.selectedObjects = [ ...new Set( [ ...state.selectedObjects, ...objectIds ] ) ]
      else
        state.selectedObjects = [ ]
    },
    ADD_SELECTED_OBJECTS( state, { objectIds } ) {
      state.selectedObjects = [ ...new Set( [ ...state.selectedObjects, ...objectIds ] ) ]
    },
    REMOVE_SELECTED_OBJECTS( state, { objectIds } ) {
      objectIds.forEach( id => {
        let index = state.selectedObjects.indexOf( id )
        if ( index !== -1 ) state.selectedObjects.splice( index, 1 )
      } )
    },
    SET_LEGEND( state, legend ) {
      state.legend = legend
    },
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

    refreshStream( context, props ) {
      return new Promise( ( resolve, reject ) => {
        Axios.get( `streams/${props.streamId}?omit=objects` )
          .then( res => {
            context.commit( 'UPDATE_STREAM', res.data.resource )
            return resolve( res )
          } )
          .catch( err => reject( err ) )
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
    createStream( context, stream ) {
      let streamId = null
      return new Promise( ( resolve, reject ) => {
        Axios.post( `streams` )
          .then( res => {
            console.log( res )
            stream.streamId = res.data.resource.streamId
            res.data.resource.onlineEditable = true
            context.commit( 'ADD_STREAMS', [ res.data.resource ] )
            return Axios.put( `streams/${res.data.resource.streamId}`, stream )
          } )
          .then( res => {
            console.log( res )
            context.commit( 'UPDATE_STREAM', stream )
            return resolve( stream )
          } )
          .catch( err => {
            console.error( err )
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
    // For data-editable streams only
    updateStreamObjectsAndLayers: ( context, { streamId, commitMessage } ) => new Promise( ( resolve, reject ) => {
      let found = context.state.deStreams.find( s => s.streamId === streamId )
      if ( !found ) return reject( new Error( 'Stream not found in store.' ) )

      found.commitMessage = commitMessage + ` (changed by ${context.state.user.name} ${context.state.user.surname})`
      found.lastChangedBy = context.state.user._id

      context.commit( 'UPDATE_STREAM', { streamId: streamId, commitMessage: commitMessage } )

      Axios.post( `streams/${streamId}/clone` )
        .then( res => {
          let originalStream = context.state.streams.find( s => s.streamId === streamId )
          context.commit( 'UPDATE_STREAM', { streamId: streamId, children: [ ...originalStream.children, res.data.clone.streamId ] } )
          return Axios.put( `streams/${streamId}`, found )
        } )
        .then( res => resolve( res ) )
        .catch( err => reject( err ) )
    } ),
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
      // TODO: https://github.com/speckleworks/SpeckleAdmin/issues/19
      Axios.delete( `streams/${payload.streamId}` )
        .then( res => {
          context.commit( 'DELETE_STREAM', { streamId: payload.streamId } )
        } )
        .catch( err => {
          console.log( err )
        } )
    },

    // objects
    getStreamObjects( context, streamId ) {
      let found = context.state.streams.find( s => s.streamId === streamId )
      return new Promise( ( resolve, reject ) => {
        context.dispatch( 'getStream', { streamId: streamId } )
          .then( ( ) => {
            return Axios.get( `streams/${streamId}?fields=objects,layers` )
          } )
          .then( res => {
            let ids = res.data.resource.objects.map( o => o._id )
            context.commit( 'UPDATE_STREAM', { streamId: streamId, objects: ids, layers: res.data.resource.layers } )
            resolve( ids )
          } )
          .catch( err => {
            reject( err )
          } )
      } )
    },
    getObjects( context, objectIds ) {
      return new Promise( ( resolve, reject ) => {
        Axios.post( `objects/getbulk?omit=base64,rawData,canRead,canWrite,children,anonymousComments,name`, objectIds )
          .then( res => {
            // context.state.objects.push( ...res.data.resources )
            // context.commit( 'ADD_OBJECTS', res.data.resources )
            resolve( res.data.resources )
          } )
          .catch( err => reject( err ) )
      } )
    },
    createObjects( context, objects ) {
      return new Promise( (resolve, reject) => {
        Axios.post(`objects`, objects)
        .then( res => resolve( res.data.resources ) )
        .catch( err => reject( err ))
      })
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
    addUserToProject: ( context, { projectId, userId } ) => new Promise( ( resolve, reject ) => {
      let project = context.state.projects.find( p => p._id === projectId )
      if ( !project ) return reject( new Error( 'Failed to find project in state.' ) )

      Axios.put( `projects/${projectId}/adduser/${userId}` )
        .then( res => {
          let permissions = { canWrite: [ ...new Set( [ ...project.permissions.canWrite, userId ] ) ], canRead: project.permissions.canRead }
          let canRead = [ ...new Set( [ ...project.canRead, userId ] ) ]
          context.commit( 'UPDATE_PROJECT', { _id: projectId, permissions: permissions, canRead: canRead } )
          project.streams.forEach( streamId => {
            let myStream = context.state.streams.find( s => s.streamId === streamId )
            context.commit( 'UPDATE_STREAM', { streamId: streamId, canWrite: uniq( [ ...myStream.canWrite, userId ] ) } )
          } )
          return resolve( )
        } )
        .catch( err => {
          console.warn( err )
          return reject( err )
        } )
    } ),
    upgradeUserInProject: ( context, { projectId, userId } ) => new Promise( ( resolve, reject ) => {
      let project = context.state.projects.find( p => p._id === projectId )
      if ( !project ) return reject( new Error( 'Failed to find project in state.' ) )
      Axios.put( `projects/${projectId}/upgradeuser/${userId}` )
        .then( res => {
          return Axios.get( `projects/${projectId}?fields=permissions` )
        } )
        .then( res => {
          context.commit( 'UPDATE_PROJECT', {
            _id: projectId,
            permissions: {
              canRead: res.data.resource.permissions.canRead, //[ ...new Set( [ ...project.canRead, userId ] ) ],
              canWrite: res.data.resource.permissions.canWrite //[ ...new Set( [ ...project.canWrite, userId ] ) ]
            }
          } )
          project.streams.forEach( streamId => {
            let myStream = context.state.streams.find( s => s.streamId === streamId )
            context.commit( 'UPDATE_STREAM', { streamId: streamId, canWrite: uniq( [ ...myStream.canWrite, userId ] ), canRead: uniq( [ ...myStream.canRead, userId ] ) } )
          } )
          return resolve( )
        } )
        .catch( err => {
          console.warn( err )
          return reject( err )
        } )
    } ),
    downgradeUserInProject: ( context, { projectId, userId } ) => new Promise( ( resolve, reject ) => {
      let project = context.state.projects.find( p => p._id === projectId )
      if ( !project ) return reject( new Error( 'Failed to find project in state.' ) )
      Axios.put( `projects/${projectId}/downgradeuser/${userId}` )
        .then( res => {
          context.commit( 'UPDATE_PROJECT', { _id: projectId, permissions: res.data.project.permissions } )
          res.data.streamsToAddReadAndPullWrite.forEach( streamId => {
            let myStream = context.state.streams.find( s => s.streamId === streamId )
            context.commit( 'UPDATE_STREAM', { streamId: streamId, canWrite: myStream.canWrite.filter( id => id !== userId ), canRead: uniq( [ ...myStream.canRead, userId ] ) } )
          } )
          res.data.streamsToAddToRead.forEach( streamId => {
            let myStream = context.state.streams.find( s => s.streamId === streamId )
            context.commit( 'UPDATE_STREAM', { streamId: streamId, canRead: uniq( [ ...myStream.canRead, userId ] ) } )
          } )
          return resolve( )
        } )
        .catch( err => {
          console.warn( err )
          return reject( err )
        } )
    } ),
    removeUserInProject: ( context, { projectId, userId } ) => new Promise( ( resolve, reject ) => {
      let project = context.state.projects.find( p => p._id === projectId )
      if ( !project ) return reject( new Error( 'Failed to find project in state.' ) )
      Axios.delete( `projects/${projectId}/removeuser/${userId}` )
        .then( res => {
          context.commit( 'UPDATE_PROJECT', { _id: projectId, canRead: res.data.project.canRead, canWrite: res.data.project.canWrite, permissions: res.data.project.permissions } )
          res.data.streamsToPullBothFrom.forEach( streamId => {
            let myStream = context.state.streams.find( s => s.streamId === streamId )
            context.commit( 'UPDATE_STREAM', { streamId: streamId, canRead: myStream.canRead.filter( id => id !== userId ), canWrite: myStream.canWrite.filter( id => id !== userId ) } )
          } )
          res.data.streamsToPullWriteFrom.forEach( streamId => {
            let myStream = context.state.streams.find( s => s.streamId === streamId )
            context.commit( 'UPDATE_STREAM', { streamId: streamId, canWrite: myStream.canWrite.filter( id => id !== userId ) } )
          } )
          res.data.streamsToPullReadFrom.forEach( streamId => {
            let myStream = context.state.streams.find( s => s.streamId === streamId )
            context.commit( 'UPDATE_STREAM', { streamId: streamId, canRead: myStream.canRead.filter( id => id !== userId ) } )
          } )
          return resolve( )
        } )
        .catch( err => {
          console.warn( err )
          return reject( err )
        } )
    } ),
    addStreamToProject: ( context, { projectId, streamId } ) => new Promise( ( resolve, reject ) => {
      let project = context.state.projects.find( p => p._id === projectId )
      if ( !project ) return reject( new Error( 'Failed to find project in state.' ) )

      Axios.put( `projects/${projectId}/addstream/${streamId}` )
        .then( res => {
          context.commit( 'UPDATE_PROJECT', { _id: projectId, streams: res.data.project.streams } )
          context.commit( 'UPDATE_STREAM', { streamId: streamId, canRead: res.data.stream.canRead, canWrite: res.data.stream.canWrite } )
          return resolve( )
        } )
        .catch( err => {
          console.warn( err )
          return reject( err )
        } )
    } ),
    removeStreamFromProject: ( context, { projectId, streamId } ) => new Promise( ( resolve, reject ) => {
      let project = context.state.projects.find( p => p._id === projectId )
      if ( !project ) return reject( new Error( 'Failed to find project in state.' ) )

      Axios.delete( `projects/${projectId}/removestream/${streamId}` )
        .then( res => {
          context.commit( 'UPDATE_PROJECT', { _id: projectId, streams: res.data.project.streams } )
          context.commit( 'UPDATE_STREAM', { streamId: streamId, canRead: res.data.stream.canRead, canWrite: res.data.stream.canWrite } )
          return resolve( )
        } )
        .catch( err => {
          console.warn( err )
          return reject( err )
        } )
    } ),
    deleteProject: ( context, props ) => new Promise( ( resolve, reject ) => {
      Axios.delete( `projects/${props._id}` )
        .then( res => {
          context.commit( 'DELETE_PROJECT', { _id: props._id } )
          for ( let stream of res.data.modifiedStreams ) {
            context.commit( 'UPDATE_STREAM', { streamId: stream.streamId, canRead: stream.canRead, canWrite: stream.canWrite } )
          }
          return resolve( )
        } )
        .catch( err => {
          console.warn( err )
          return reject( err )
        } )
    } ),

    // processors
    loadLambdas ( context ) {
      return new Promise(( resolve, reject ) => {
        let promises = []
        let myLambdas = new LambdaSettings().Lambdas

        for(let i = 0; i < myLambdas.length; i++)
        {
          promises.push(
            Axios({
              method: 'GET',
              url: `.netlify/functions/${myLambdas[i]}`,
              baseURL: location.protocol + '//' + location.host,
            })
          )
        }

        Promise.all(promises)
          .then( res => {
            var lambdas = []

            res.forEach( r => {
              let data = r.data
              data.function = r.request.responseURL.split('/').slice(-1).pop()
              lambdas.push(data)
            })

            context.commit( 'ADD_LAMBDAS', lambdas )
            return resolve ( lambdas )
          } )
      }) 


    },
    getProcessor( context, props ) {
      var processor = JSON.parse(window.localStorage.getItem("processor_" + props._id))

      if (processor !== null)
        context.commit( 'ADD_PROCESSORS', [ processor ] )

      return processor
    },
    getProcessors( context ) {
      var processorIds = JSON.parse(window.localStorage.getItem("processorIds"))

      if (processorIds === null)
        return null
      
      var processors = [ ]
      processorIds.forEach( id => {
        var processor = JSON.parse(window.localStorage.getItem("processor_" + id))
        if (processor != null)
          processors.unshift(processor)
      })

      context.commit( 'ADD_PROCESSORS', processors )

      return processors
    },
    createProcessor( context, processor ) {
      var id = uuid()
      
      var proc = processor ? processor : { name: 'A new speckle processor' }
      
      // Always assign new ID
      proc._id = id

      if (!proc.hasOwnProperty('description'))
        proc.description = "This is a simple speckle processor."
      
      if (!proc.hasOwnProperty('tags'))
        proc.tags = [ ]
        
      if (!proc.hasOwnProperty('blocks'))
        proc.blocks = [ ]
      
      if (!proc.hasOwnProperty('params'))
        proc.params = [ ]

      // Properties added for compatibility with other components
      // as well as for future storage in server
      proc.owner = context.state.user._id
      proc.private = false
      proc.canRead = [ context.state.user._id ]
      proc.canWrite = [ context.state.user._id ]

      proc.anonymousComments = false
      proc.comments = []

      window.localStorage.setItem(
        "processor_" + id,
        JSON.stringify(proc)
      )

      context.commit( 'ADD_PROCESSORS', [ proc ] )

      var processorIds = JSON.parse(window.localStorage.getItem("processorIds"))

      if (processorIds === null)
        processorIds = [ ]
      
      processorIds.unshift(id)

      window.localStorage.setItem(
        "processorIds",
        JSON.stringify(processorIds)
      )

      return proc
    },
    updateProcessor( context, props ) {
      let found = JSON.parse(window.localStorage.getItem("processor_" + props._id))

      Object.keys( props ).forEach( key => {
        found[ key ] = props[ key ]
      } )
      window.localStorage.setItem(
        "processor_" + props._id,
        JSON.stringify(found)
      )

      context.commit( 'UPDATE_PROCESSOR', props )
    },
    deleteProcessor( context, props ) {
      window.localStorage.removeItem("processor_" + props._id)

      context.commit( 'DELETE_PROCESSOR', props )

      var processorIds = JSON.parse(window.localStorage.getItem("processorIds"))

      if (processorIds !== null)
      {
        var foundIndex = processorIds.indexOf(props._id)
        if (foundIndex !== -1)
        {
          processorIds.splice(foundIndex, 1)
          
          window.localStorage.setItem(
            "processorIds",
            JSON.stringify(processorIds)
          )
        }
      }
    },
    async authenticateBlocks( context, blocks ) {
      for (let i = 0; i < blocks.length; i++)
      {
        if(blocks[i].msal)
        {
          let propName = 'msal|' + blocks[i].msal.clientId
          let token = await getTokenMSAL(blocks[i].msal)
          context.commit( 'ADD_TOKEN', {id: propName, token: token})
        }
      }
    },
    
    // client for ws ids, etc.
    createClient: ( context, props ) => new Promise( ( resolve, reject ) => {

      // NOTE: This is a stupid hack. To get a temp client, we need to be not auhtorised : /
      delete Axios.defaults.headers.common[ 'Authorization' ]

      Axios.post( `clients`, { role: 'online-client', documentName: 'Online interface', documentType: 'browser', online: true } )
        .then( res => {
          console.log( res )
          context.commit( 'SET_WEB_APP_CLIENT', res.data.resource )
          return resolve( res.data.resource )
        } )
        .catch( err => {
          console.warn( err )
          return reject( err )
        } )
      // set the headers back. man what a stupid hack this is...
      Axios.defaults.headers.common[ 'Authorization' ] = context.state.token
    } ),

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

    updateLoggedInUser: ( context, payload ) => new Promise( ( resolve, reject ) => {
      Axios.put( `accounts`, payload )
        .then( res => {
          context.commit( 'UPDATE_LUSER', payload )
          return resolve( res )
        } )
        .catch( err => reject( err ) )
    } ),

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
    },
  }
})
