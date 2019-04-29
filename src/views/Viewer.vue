<template>
  <v-container fluid xxx-fill-height pa-0 style='height: calc(100vh - 64px);'>
    <div class='renderer' ref='render'></div>
    <v-hover>
      <v-navigation-drawer slot-scope="{ hover }" floating permanent stateless width='520' value="true" :class='`${hover ? "elevation-3" : "transparent elevation-0"}`' style='height:auto; max-height: calc(100vh - 64px); overflow-y: auto; direction: rtl; left: -20px; position:relative; z-index:1; transition: all .3s ease;'>
        <v-layout row wrap style="direction:ltr; padding-left:20px;">
          <v-flex xs12>
            <v-tabs grow slider-color='primary' color='rgba(0,0,0,0)'>
              <v-tab key='streams'>
                <v-icon>import_export</v-icon>
              </v-tab>
              <v-tab key='filter'>
                <v-icon>dns</v-icon>
              </v-tab>
              <v-tab key='inspector'>
                <v-badge small right :value='$store.state.selectedObjects.length>0' color='primary'>
                  <template v-slot:badge>
                    <span>{{$store.state.selectedObjects.length}}</span>
                  </template>
                  <v-icon>
                    code
                  </v-icon>
                </v-badge>
              </v-tab>
              <v-tab-item key='streams'>
                <v-card class='elevation-0 transparent'>
                  <v-progress-linear :indeterminate="true" v-show='showLoading' height='2'></v-progress-linear>
                  <v-card-text>
                    <stream-search v-on:selected-stream='addStream' :streams-to-omit='loadedStreamIds'></stream-search>
                    <stream-card v-for='stream in loadedStreams' :stream='stream' :key='stream.streamId' @remove='removeStream'></stream-card>
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item key='filter'>
                <v-card class='elevation-0 transparent'>
                  <v-card-text>
                    <v-autocomplete box label='select a property to group objects by' clearable v-model="selectedFilter" :items="$store.getters.objectPropertyKeys.stringKeys"></v-autocomplete>
                    <object-groups :group-key='selectedFilter'></object-groups>
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item key='inspector'>
                <v-card class='elevation-0 transparent'>
                  <v-card-text>
                    <!-- {{$store.state.selectedObjects}} -->
                    <selected-objects></selected-objects>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-flex>
        </v-layout>
      </v-navigation-drawer>
    </v-hover>
    <v-menu top offset-y :close-on-content-click="false">
      <template v-slot:activator='{on}'>
        <v-btn fab fixed bottom right v-on='on'>
          <v-icon>share</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-text>
          <v-icon small>link</v-icon>&nbsp; <span class='caption' style="user-select:all">{{ shareLink }}</span>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-container>
</template>
<script>
import debounce from 'lodash.debounce'

import StreamCard from '@/components/ViewerLoadedStreamsCard.vue'
import StreamSearch from '@/components/StreamSearch.vue'
import ObjectGroups from '@/components/ViewerObjectGroups.vue'
import SelectedObjects from '@/components/ViewerSelectedObjects.vue'

import SpeckleRenderer from '@/renderer/SpeckleRenderer.js'

export default {
  name: 'ViewerView',
  components: { StreamSearch, StreamCard, ObjectGroups, SelectedObjects },
  computed: {
    loadedStreamIds( ) {
      return this.$store.state.loadedStreamIds
    },
    loadedStreams( ) {
      return this.$store.state.streams.filter( str => this.loadedStreamIds.indexOf( str.streamId ) !== -1 )
    },
    streams( ) {
      return this.$store.state.streams.filter( s => this.streamIds.indexOf( s.streamId ) !== -1 )
    },
    streamIds( ) {
      return this.$store.state.loadedStreamIds
    },
    shareLink( ) {
      // let streams = this.$store.state.loadedStreamIds.join( ',' )
      return window.location.href
    }
  },
  data( ) {
    return {
      showLoading: false,
      toRequest: [ ],
      requestBuckets: [ ],
      isRequesting: false,
      pauseRequesting: false,
      bucketInProgress: false,
      removeInterval: null,
      streamsToRemove: [ ],
      selectedFilter: null
    }
  },
  methods: {
    appendStreamsToRoute( streamId ) {
      // NOTE: this functionality is disabled because o
      let streams = this.$store.state.loadedStreamIds.join( ',' )
      this.$router.replace( { name: 'viewer', params: { streamIds: streams } } )
    },
    async addStream( streamId ) {
      this.showLoading = true
      this.$store.commit( 'ADD_LOADED_STREAMID', streamId )
      this.appendStreamsToRoute( )
      let objectIds = await this.$store.dispatch( 'getStreamObjects', streamId )

      // loaded already?
      let toRequest = objectIds.filter( id => this.$store.state.objects.findIndex( o => o._id === id ) === -1 )
      let toUpdate = objectIds.filter( id => this.$store.state.objects.findIndex( o => o._id === id ) !== -1 )
      this.$store.commit( 'UPDATE_OBJECTS_STREAMS', { objIds: toUpdate, streamToAdd: streamId } )

      let bucket = [ ],
        maxReq = 50 // magic number; maximum objects to request in a bucket

      for ( let i = 0; i < toRequest.length; i++ ) {
        bucket.push( toRequest[ i ] )
        if ( i % maxReq === 0 && i !== 0 ) {
          this.requestBuckets.push( { objectIds: [ ...bucket ], streamId: streamId } )
          bucket = [ ]
          if ( !this.isRequesting ) this.bucketProcessor( )
        }
      }

      // last one
      if ( bucket.length !== 0 ) {
        this.requestBuckets.push( { objectIds: [ ...bucket ], streamId: streamId } )
        if ( !this.isRequesting ) this.bucketProcessor( )
      }
    },
    // Goes through all the request buckets and requests them from the server,
    // then plops them in the renderer as they go
    async bucketProcessor( ) {
      if ( this.pauseRequesting ) return
      if ( this.requestBuckets.length === 0 ) {
        this.isRequesting = false
        // as we don't want to flood the vue store with a lotta add objects calls,
        // we store all objects in an accumulator and commit that once we're done
        if ( this.objectAccumulator.length > 0 )
          this.$store.commit( 'ADD_OBJECTS', this.objectAccumulator )
        this.objectAccumulator = [ ]
        console.log( `done processing buckets!` )
        this.showLoading = false
        bus.$emit( 'loading-done' )
        return
      }

      this.isRequesting = true
      this.bucketInProgress = true

      let objs = await this.$store.dispatch( 'getObjects', this.requestBuckets[ 0 ].objectIds )
      let stream = this.$store.state.streams.find( s => s.streamId === this.requestBuckets[ 0 ].streamId )

      objs.forEach( ( o, index ) => {
        if ( !o.properties ) o.properties = {}
        o.properties.id = o._id ? o._id : 'no id'
        o.properties.hash = o.hash ? o.hash : 'no hash'
        o.properties.speckle_type = o.type
        let objIndexInStream = stream.objects.indexOf( o._id )
        o.properties.objIndexInStream = objIndexInStream

        let layer = null
        for ( let ll of stream.layers ) {
          if ( objIndexInStream >= ll.startIndex )
            if ( objIndexInStream < ll.startIndex + ll.objectCount )
              layer = ll
        }

        o.streams = [ this.requestBuckets[ 0 ].streamId ]

        if ( layer && layer.properties ) {
          o.color = { hex: '#B3B3B3', a: 0.65 }
          o.properties.layer_guid = layer.guid ? layer.guid : 'no layer guid'
          o.properties.layer_name = layer.name
        } else if ( layer ) {
          o.properties.layer_guid = layer.guid
          o.properties.layer_name = layer.name
          o.color = { hex: '#B3B3B3', a: 0.65 }
        } else {
          o.properties.layer_name = 'no layer'
          o.color = { hex: '#B3B3B3', a: 0.65 }
        }

      } )

      this.objectAccumulator.push( ...objs.map( obj => { return Object.freeze( { type: obj.type, properties: obj.properties ? obj.properties : null, streams: obj.streams, _id: obj._id, hash: obj.hash } ) } ) )
      // No freezing as we're modifying the props; mem footprint seems ok still
      // this.objectAccumulator.push( ...objs.map( obj => { return { type: obj.type, properties: obj.properties ? obj.properties : null, streams: obj.streams, _id: obj._id, hash: obj.hash } } ) )

      this.renderer.loadObjects( { objs: objs, zoomExtents: this.requestBuckets.length === 1 } )
      this.requestBuckets.splice( 0, 1 )

      this.bucketInProgress = false
      this.bucketProcessor( )
    },

    // pauses and any bucket loading and waits for it to stop,
    // then triggers the real remove stream
    async removeStream( streamId ) {
      this.pauseRequesting = true
      if ( this.streamsToRemove.indexOf( streamId ) === -1 )
        this.streamsToRemove.push( streamId )
      this.removeInterval = setInterval( this.removeStreamInternal.bind( this ), 250 )
    },

    // removes any objects pertaining to one stream, even half loaded ones
    // works with a temporary state. Restarts the bucket processor
    // in case there were other buckets queued from other stream loads.
    removeStreamInternal( ) {
      if ( this.bucketInProgress ) return
      clearInterval( this.removeInterval )
      // create a list of all objects, including ones that are possibly still "accumulating"
      let tempState = [ ...this.$store.state.objects, ...this.objectAccumulator ]

      // clean future loading buckets, if any are present
      this.requestBuckets = this.requestBuckets.filter( b => this.streamsToRemove.indexOf( b.streamId ) === -1 )

      let objIdsToUnload = [ ]
      this.streams.forEach( s => this.streamsToRemove.indexOf( s.streamId ) !== -1 ? objIdsToUnload.push( ...s.objects ) : null )

      this.streamsToRemove.forEach( stream => this.$store.commit( 'UPDATE_OBJECTS_STREAMS', { objIds: objIdsToUnload, streamToRemove: stream } ) )

      // filter out objects that are in another stream.
      objIdsToUnload = objIdsToUnload.filter( id => {
        let x = tempState.find( o => o._id === id )
        if ( x ) return x.streams.length === 0
        return false // means the object was not loaded yet
      } )

      this.streamsToRemove.forEach( sId => {
        this.$store.commit( 'REMOVE_LOADED_STREAMID', sId )
      } )

      this.$store.commit( 'REMOVE_OBJECTS', objIdsToUnload )

      this.renderer.unloadObjects( { objIds: objIdsToUnload } )
      this.pauseRequesting = false
      this.streamsToRemove = [ ]
      this.appendStreamsToRoute( )
      // restart the bucket processor
      this.bucketProcessor( )
    },

    setBucketsAndGo( buckets ) {
      // this.showLoading = true
      this.requestBuckets = buckets
      this.bucketProcessor( )
    },

    fetchStreamsFromRoute( ) {
      if ( this.$route.params.streamIds ) {
        let urlStreams = this.$route.params.streamIds.split( ',' )
        let streamsToLoad = urlStreams.filter( id => this.$store.state.loadedStreamIds.indexOf( id ) === -1 )
        let streamsToUnload = this.$store.state.loadedStreamIds.filter( id => urlStreams.indexOf( id ) === -1 )
        console.log( `i need to load ${streamsToLoad.join(", ")}` )
        console.log( `i need to unload ${streamsToUnload.join(", ")}` )
        streamsToUnload.forEach( sid => this.removeStream( sid ) )
        streamsToLoad.forEach( sid => this.addStream( sid ) )
      }
    }
  },
  activated( ) {
    console.log( 'activated' )
    document.body.classList.add( 'no-scroll' )

    this.fetchStreamsFromRoute( )
    this.appendStreamsToRoute( )
  },
  deactivated( ) {
    console.log( 'de-activated' )
    document.body.classList.remove( 'no-scroll' )
  },
  mounted( ) {
    console.log( 'mounted' )
    this.objectAccumulator = [ ]
    this.renderer = new SpeckleRenderer( { domObject: this.$refs.render } )
    this.renderer.animate( )

    // if you like polluting the global scope, clap twice
    window.renderer = this.renderer

    // add streams to viewer
    this.fetchStreamsFromRoute( )

    // Set render events
    this.renderer.on( 'select-objects', debounce( function( ids ) {
      this.$store.commit( 'SET_SELECTED_OBJECTS', { objectIds: ids } )
    }.bind( this ), 250 ) )

    this.renderer.on( 'select-add-objects', debounce( function( ids ) {
      this.$store.commit( 'ADD_SELECTED_OBJECTS', { objectIds: ids } )
    }.bind( this ), 250 ) )

    this.renderer.on( 'select-remove-objects', debounce( function( ids ) {
      this.$store.commit( 'REMOVE_SELECTED_OBJECTS', { objectIds: ids } )
    }.bind( this ), 250 ) )

    this.renderer.on( 'analysis-legend', legend => {
      this.$store.commit( 'SET_LEGEND', legend )
    } )

    this.renderer.on( 'clear-analysis-legend', ( ) => {
      this.$store.commit( 'SET_LEGEND', null )
    } )
  }
}

</script>
<style scoped lang='scss'>
.renderer {
  position: absolute;
  width: 100%;
  /*don't ask re below, i just don't like round numbers */
  height: 99.8%;
  /*z-index: 10000;*/
}

</style>
