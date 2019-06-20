<template>
  <v-container grid-list-xl>
    <v-layout row wrap>
      <v-flex xs12 pt-5 pb-0 class='headline font-weight-light'>
        Processor allows you to run scripts on streams.
        <v-btn color="primary" @click="runProcessor">
          Run
        </v-btn>
      </v-flex>
      <v-flex xs12>
      <v-text-field v-model="initInput">
      </v-text-field>
      </v-flex>
      <v-flex xs12 v-for='(block, index) in chosenBlocks' :key='index'>
        <processor-block
          :index='index'
          :block='block'
          :output='blockOutput[index]'
          :successRun='blockSuccess[index]'
          v-on:remove-block="removeBlock"
          v-on:update-param="updateParam"/>
      </v-flex>
      <v-flex xs12>
        <v-combobox
          :items="allBlocks"
          :item-text="(block) => block.name"
          v-on:change="addBlock"
          label="Add new block">
        </v-combobox>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import ProcessorBlock from '../components/ProcessorBlock.vue'

export default {
  name: 'ProcessorView',
  components: {
    ProcessorBlock,
  },
  computed: {
    allBlocks () {
      return this.$store.state.blocks
    }
  },
  data( ) {
    return {
      initInput: "",
      chosenBlocks: [ ],
      blockSuccess: [ ],
      blockOutput: [ ],
      blockParams: [ ],
      
      toRequest: [ ],
      requestBuckets: [ ],
      isRequesting: false,
      pauseRequesting: false,
      bucketInProgress: false,
    }
  },
  mutations: {

  },
  methods: {
    runProcessor ( ) {
      var input = this.initInput
      var output = null

      this.blockOutput.splice(0, this.blockOutput.length)
      this.blockSuccess.splice(0, this.blockSuccess.length)

      for (let i = 0; i < this.chosenBlocks.length; i++)
      {
        try
        {
          var params = this.blockParams[i]
          eval(this.chosenBlocks[i].script)
          this.blockSuccess.push(true)
          this.blockOutput.push(output)
          input = output
          console.log(output)
        }
        catch (error) {
          this.blockSuccess.push(false)
          this.blockOutput.push(error)
          return
        }
      }
    },

    addBlock ( sender ) {
      this.blockOutput.splice(0, this.blockOutput.length)
      this.blockSuccess.splice(0, this.blockSuccess.length)

      if (sender != null)
        this.chosenBlocks.push( sender )
    },

    removeBlock ( index ) {
      this.blockOutput.splice(0, this.blockOutput.length)
      this.blockSuccess.splice(0, this.blockSuccess.length)

      this.chosenBlocks.splice(index, 1)
    },

    updateParam ( o ) {
      this.blockParams[o.index] = o.params
      console.log(this.blockParams)
    },

    appendStreamsToRoute( streamId ) {
      // NOTE: this functionality is disabled because o
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

    // Goes through all the request buckets and requests them from the server
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

      this.requestBuckets.splice( 0, 1 )

      this.bucketInProgress = false
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
    console.log( 'mounted' )
    this.objectAccumulator = [ ]

    // add streams to viewer
    this.fetchStreamsFromRoute( )
  }
}
</script>
<style scoped lang='scss'>
</style>
