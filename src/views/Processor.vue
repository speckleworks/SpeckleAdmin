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
          :items="blocks"
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
  },
  data( ) {
    return {
      streamIds: [ ],

      initInput: "",

      blocks: [ ],

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
      var blockInput = this.initInput
      var i = 0

      if (this.blockOutput.length > 0)
      {
        blockInput = this.blockOutput[this.blockOutput.length - 1]
        i = this.blockOutput.length
      }

      for (; i < this.chosenBlocks.length; i++)
      {
        var params = this.blockParams[i] ? this.blockParams[i] : new Object
        
        if (this.chosenBlocks[i].allowBucketing && blockInput.constructor === Array)
        {
          // Try to chunk the payload if it is an array
          var bucket = [ ],
            maxReq = 50 // magic number; maximum objects to request in a bucket

          var output = [ ]

          for (let j = 0; j < blockInput.length; j++)
          {
            bucket.push( blockInput[j] )

            if ( j % maxReq === 0 && j !== 0 ) {
              let result = await this.callLambda( this.chosenBlocks[i].function, bucket, params )
                .catch( err => {
                  console.log(err.response.data)
                  this.blockSuccess.push(false)
                  this.blockOutput.push(err.response.data)
                  return
                })

              if (result.data.constructor === Array)
                output.push(...result.data)
              else
                output.push(result.data)

              bucket = [ ]
            }
          }

          if ( bucket.length > 0 ) {
            let result = await this.callLambda( this.chosenBlocks[i].function, bucket, params )
              .catch( err => {
                console.log(err.response.data)
                this.blockSuccess.push(false)
                this.blockOutput.push(err.response.data)
                return
              })

            if (result.data.constructor === Array)
              output.push(...result.data)
            else
              output.push(result.data)
            
            bucket = [ ]
          }

          console.log(output)
          this.blockSuccess.push(true)
          this.blockOutput.push(output)
          blockInput = output
        }
        else
        {
          let result = await this.callLambda( this.chosenBlocks[i].function, blockInput, params )
            .catch( err => {
              console.log(err.response.data)
              this.blockSuccess.push(false)
              this.blockOutput.push(err.response.data)
              return
            })
          this.blockSuccess.push(true)
          this.blockOutput.push(result.data)
          blockInput = result.data
          console.log(result.data)
        }
      }
    },

    callLambda( func, input, params ) {
      return new Promise((resolve, reject) => {
        Axios({
          method: 'POST',
          url: `.netlify/functions/${func}`,
          baseURL: location.protocol + '//' + location.host,
          data: {
            baseUrl: this.$store.state.server,
            token: Axios.defaults.headers.common[ 'Authorization' ],
            streamIds: this.streamIds,
            input: input,
            parameters: params,
          },
        })
          .then( res => resolve(res) )
          .catch ( err => reject(err) )
      })
    },

    addBlock ( sender ) {
      if (sender != null)
        this.chosenBlocks.push( sender )
    },

    removeBlock ( index ) {
      this.blockOutput.splice(index, this.blockOutput.length - index)
      this.blockSuccess.splice(index, this.blockSuccess.length - index)

      this.blockParams.splice(index, 1)
      this.chosenBlocks.splice(index, 1)
    },

    updateParam ( payload ) {
      this.blockOutput.splice(payload.index, this.blockOutput.length - payload.index)
      this.blockSuccess.splice(payload.index, this.blockSuccess.length - payload.index)

      this.blockParams[payload.index] = payload.params
    },

    loadBlocks ( ) {
      let lambdas = this.$store.state.blocks

      for(let i = 0; i < lambdas.length; i++)
      {
        Axios({
          method: 'GET',
          url: `.netlify/functions/${lambdas[i]}`,
          baseURL: location.protocol + '//' + location.host,
        })
          .then( res => {
            var data = res.data
            data.function = lambdas[i]
            this.blocks.push(data)
          } ) 
          .catch( err => console.log(err) )
      }
      
      console.log( 'loaded blocks' )
    }
  },

  mounted( ) {
    console.log( 'mounted' )

    if ( this.$route.params.streamIds ) {
      this.streamIds = this.$route.params.streamIds.split( ',' )
    }

    this.loadBlocks()
  }
}
</script>
<style scoped lang='scss'>
</style>
