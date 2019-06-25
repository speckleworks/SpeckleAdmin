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
import Axios from 'axios'


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
    async runProcessor ( ) {
      let result = await Axios({
        method: 'POST',
        url: '.netlify/functions/receiver',
        baseURL: location.protocol + '//' + location.host,
        data: {
          baseUrl: this.$store.state.server,
          token: Axios.defaults.headers.common[ 'Authorization' ],
          streamId: `SsQ_U00IU-`,
        },
      })

      console.log(result)
      return;

      var input = this.initInput

      this.blockOutput.splice(0, this.blockOutput.length)
      this.blockSuccess.splice(0, this.blockSuccess.length)

      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

      for (let i = 0; i < this.chosenBlocks.length; i++)
      {
        // try
        // {
          var params = this.blockParams[i] ? this.blockParams[i] : new Object
          let foo = new AsyncFunction("self", "input", "params", this.chosenBlocks[i].script)
          let output = await foo(this, input, params)
          this.blockSuccess.push(true)
          this.blockOutput.push(output)
          console.log(output)
          input = output
        // }
        // catch (error) {
        //   this.blockSuccess.push(false)
        //   this.blockOutput.push(error)
        //   return
        // }
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

      this.objectAccumulator.push( ...objs.map( obj => { return obj } ) )

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
