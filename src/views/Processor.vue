<template>
  <v-container grid-list-xl>
    <v-layout row wrap>
      <v-flex xs12 pt-5 pb-0 class='headline font-weight-light'>
        Processor allows you to run scripts on streams.
      </v-flex>
      <v-flex xs6>
        <v-btn
          :color='buttonColor'
          @click="runProcess()"
          >Run
        </v-btn>
      </v-flex>
      <v-flex xs12>
        <v-textarea
          solo
          :hint='searchHint'
          v-model='scriptText'
          label="Your script"
          :auto-grow="true"
          :spellcheck="false"
          style="font-family:Consolas,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New, monospace"
        >
        </v-textarea>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  name: 'ProcessorView',
  computed: {},
  data( ) {
    return {
      showLoading: false,
      buttonColor: "info",
      scriptText: '',
      searchHint: 'Script your life!',
      outputText: '',
      
      showLoading: false,
      loadingProgress: 0,
      loadingIsDeterminate: false,
      toRequest: [ ],
      requestBuckets: [ ],
      isRequesting: false,
      pauseRequesting: false,
      bucketInProgress: false,
      removeInterval: null,
      streamsToRemove: [ ],
      selectedFilter: null,
    }
  },
  methods: {
    runProcess( ) {
      try
      {
        eval(this.scriptText)
        this.buttonColor = "success"
      }
      catch (err)
      {
        this.buttonColor = "error"
        alert(err.message)
      }
    },

    appendStreamsToRoute( streamId ) {
      let streams = this.$store.state.loadedStreamIds.join( ',' )
      if ( streams !== '' )
        this.$router.replace( { name: 'processor', params: { streamIds: streams } } )
      else this.$router.replace( { name: 'processor' } )
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

      this.objectAccumulator.push( ...objs )//.map( obj => { return Object.freeze( { type: obj.type, properties: obj.properties ? obj.properties : null, streams: obj.streams, _id: obj._id, hash: obj.hash } ) } ) )
      
      // No freezing as we're modifying the props; mem footprint seems ok still
      // this.streamObjects.push( ...objs.map( obj => { return { type: obj.type, properties: obj.properties ? obj.properties : null, streams: obj.streams, _id: obj._id, hash: obj.hash } } ) )

      // this.renderer.loadObjects( { objs: objs, zoomExtents: this.requestBuckets.length === 1 } )
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

  mounted( ) {
    this.objectAccumulator = [ ]

    this.fetchStreamsFromRoute( )
  }
}

</script>
<style scoped lang='scss'>
</style>
