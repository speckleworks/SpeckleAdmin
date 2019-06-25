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
      streamId: '',

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

      this.blockOutput.splice(0, this.blockOutput.length)
      this.blockSuccess.splice(0, this.blockSuccess.length)

      for (let i = 0; i < this.chosenBlocks.length; i++)
      {
        var params = this.blockParams[i] ? this.blockParams[i] : new Object
        
        let output = await new Promise((resolve, reject) => {
          Axios({
            method: 'POST',
            url: `.netlify/functions/${this.chosenBlocks[i].function}`,
            baseURL: location.protocol + '//' + location.host,
            data: {
              baseUrl: this.$store.state.server,
              token: Axios.defaults.headers.common[ 'Authorization' ],
              streamId: this.streamId,
              input: blockInput,
              parameters: params,
            },
          })
            .then( res => resolve(res) )
            .catch ( err => reject(err) )
        })

        this.blockSuccess.push(true)
        this.blockOutput.push(output.data)
        console.log(output.data)
        blockInput = output.data
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
  },

  mounted( ) {
    console.log( 'mounted' )

    if ( this.$route.params.streamIds ) {
      this.streamId = this.$route.params.streamIds
    }

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
}
</script>
<style scoped lang='scss'>
</style>
