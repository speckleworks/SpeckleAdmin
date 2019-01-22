<template>
  <div class='md-layout viewer-main'>
    <div class="view-part-render md-layout-item" ref='render'></div>
    <div class="md-layout-item md-size-50 view-part-data md-elevation-20">
      <md-tabs md-alignment="fixed" class='md-primary'>
        <md-tab id="tab-x" md-label="Streams" md-icon="import_export">
          <br>
          <div class='md-caption text-center'>isRequesting: {{isRequesting}}; buckets: {{requestBuckets.length}} | objs in store: {{$store.state.objects.length}}</div>
          <br>
          <stream-search @selected-stream='addStream' :streams-to-omit='streamIds'></stream-search>
          <br>
          <stream-card-renderer v-for='stream in streams' :stream='stream' @remove-stream='removeStream'></stream-card-renderer>
        </md-tab>
        <md-tab id="tab-data" md-label="Data" md-icon="storage">
          <md-content style='padding:16px;'>
            <object-data-view :selected-objects='selectedObjects' :analysis-legend='analysisLegend'></object-data-view>
          </md-content>
        </md-tab>
        <!--  <md-tab id="tab-comments" md-label="Comments" md-icon="question_answer">
          <h3>Test</h3>
        </md-tab> -->
      </md-tabs>
    </div>
  </div>
</template>
<script>
import flatten from 'flat'

import HelloWorld from '@/components/HelloWorld.vue'
import StreamSearch from '@/components/StreamSearch.vue'
import StreamCardRenderer from '@/components/StreamCardRenderer.vue'
import ObjectDataView from '@/components/ObjectDataView.vue'

import SpeckleRenderer from '@/renderer/SpeckleRenderer.js'

export default {
  name: 'ViewerView',
  components: {
    StreamSearch,
    StreamCardRenderer,
    ObjectDataView
  },
  computed: {
    streams( ) {
      return this.streamIds.map( id => this.$store.state.streams.find( s => s.streamId === id ) )
    }
  },
  watch: {},
  data( ) {
    return {
      streamIds: [ ],
      toRequest: [ ],
      requestBuckets: [ ],
      isRequesting: false,
      pauseRequesting: false,
      bucketInProgress: false,
      removeInterval: null,
      streamsToRemove: [ ],
      selectedObjects: [ ],
      analysisLegend: null
    }
  },
  methods: {
    async addStream( streamId ) {
      this.streamIds.unshift( streamId )
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

        let layer = stream.layers.find( l => l.startIndex >= index && index < l.startIndex + l.objectCount )
        o.streams = [ this.requestBuckets[ 0 ].streamId ]
        if ( layer && layer.properties ) {
          o.color = layer.properties.color ? layer.properties.color : { hex: '#4E8EFE', a: 0.75 }
          o.properties.layerGuid = layer.guid ? layer.guid : 'no layer guid'
        } else
          o.color = { hex: '#4E8EFE', a: 0.75 }

      } )

      this.objectAccumulator.push( ...objs.map( obj => { return Object.freeze( { type: obj.type, properties: obj.properties ? obj.properties : null, streams: obj.streams, _id: obj._id, hash: obj.hash } ) } ) )

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

      this.streamsToRemove.forEach( sId => this.streamIds.splice( this.streamIds.indexOf( sId ), 1 ) )

      this.$store.commit( 'REMOVE_OBJECTS', objIdsToUnload )

      this.renderer.unloadObjects( { objIds: objIdsToUnload } )
      this.pauseRequesting = false
      this.streamsToRemove = [ ]
      // restart the bucket processor
      this.bucketProcessor( )
    },

    colorByTemp( ) {
      this.renderer.colorByProperty( { propertyName: 'stringProp' } )
    },

    resetColors( ) {
      this.renderer.resetColors( )
    }

  },
  activated( ) {},
  deactivated( ) {},
  mounted( ) {
    // non reactive instance props
    this.objectAccumulator = [ ]
    this.renderer = new SpeckleRenderer( { domObject: this.$refs.render } )
    this.renderer.animate( )

    window.renderer = this.renderer // let's pollute the global scope yea!

    this.renderer.on( 'select-objects', ids => {
      this.selectedObjects = ids
    } )
    this.renderer.on( 'select-add-objects', ids => {
      ids.forEach( id => {
        if ( this.selectedObjects.indexOf( id ) === -1 ) this.selectedObjects.push( id )
      } )
    } )
    this.renderer.on( 'select-remove-objects', ids => {
      ids.forEach( id => {
        let index = this.selectedObjects.indexOf( id )
        if ( index != -1 ) this.selectedObjects.splice( index, 1 )
      } )
    } )

    this.renderer.on( 'analysis-legend', legend => {
      this.analysisLegend = legend
    } )
    this.renderer.on( 'clear-analysis-legend', ( ) => {
      this.analysisLegend = null
    } )

  }
}

</script>
<style scoped lang='scss'>
.viewer-main {
  margin: -16px;
  height: 100vh;
}

.md-tab {
  padding: 0 !important;
}

.view-part-render {
  /*background: #333333;*/
  background: #E4EBF6;
}

.view-part-data {
  overflow: auto;
}

</style>
