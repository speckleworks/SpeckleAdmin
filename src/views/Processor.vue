<template>
  <v-container grid-list-xl>
    <div style='position: absolute; top:0; left: 0; width: 100%;'>
      <v-progress-linear :indeterminate="true" v-show='isLoading' height='2' class='ma-0'></v-progress-linear>
    </div>
    <v-card xs12 sm12 md12 class="my-5" v-if="!isLoading">
      <v-card-title>
        <v-flex xs12 sm12 md12>
          <v-text-field v-model="name" @change='updateBlock' class="title font-light-weight mt-4">
          </v-text-field>
        </v-flex>
      </v-card-title>
      <v-card-text>
        <v-flex xs12 sm12 md12>
          <v-textarea v-model="description" @change='updateBlock' class="font-light-weight">
          </v-textarea>
        </v-flex>
      </v-card-text>
      <v-card-actions>
        <v-dialog
          max-width="500">
          <template v-slot:activator="{ on }">
            <v-btn round small depressed v-on="on">
              <v-icon>share</v-icon>
              <span class="mx-2">share</span>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class='font-weight-light title'>
                Share link
              </span>
            </v-card-title>
            <v-card-text>
              <v-text-field :readonly="true" v-model="shareLink"></v-text-field>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-card-actions>
    </v-card>
    <v-layout row wrap v-if="!isLoading">
      <v-flex>
        <v-card>
          <template>
            <v-flex xs12 ma-0 pa-0 v-for='(block, index) in chosenBlocks' :key='index'>
              <processor-block
                :index='index'
                :block='block'
                :output='blockOutput[index]'
                :status='blockStatus[index]'
                :params='blockParams[index]'
                v-on:remove-block="removeBlock"
                v-on:update-param="updateParam"/>
            </v-flex>
          </template>
          <v-flex xs12>
            <v-select
              return-object
              :items="blocks"
              v-on:input="addBlock"
              label="Add new block">
              <template slot="selection">
                {{null}}
              </template>
              <template slot="item" slot-scope="blocks">
                <v-icon class="mr-2">
                  {{blocks.item.icon ? blocks.item.icon : 'code'}}
                </v-icon>
                {{blocks.item.name}}
              </template>
            </v-select>
          </v-flex>
        </v-card>
      </v-flex>
    </v-layout>
    <v-btn color="primary" dark fixed large bottom right fab @click="runProcessor">
      <v-icon>
        {{this.reRun ? "replay" : "play_arrow"}}
      </v-icon>
    </v-btn>
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
    name: {
      get: function() {
        return this.processor.name ? this.processor.name : ""
      },
      set: function(val) {
        this.processor.name = val
      }
    },
    description: {
      get: function() {
        return this.processor.description ? this.processor.description : ""
      },
      set: function(val) {
        this.processor.description = val
      }
    },
    chosenBlocks: {
      get: function() {
        return this.processor.blocks ? this.processor.blocks : []
      },
      set: function(val) {
        this.processor.blocks = val
      }
    },
    blockParams: {
      get: function() {
        return this.processor.params ? this.processor.params : []
      },
      set: function(val) {
        this.processor.params = val
      }
    },
    shareLink: function() {
      return window.location.origin + "/#/processors/import?processor=" + btoa(JSON.stringify(this.processor))
    },
    reRun: function () {
      if (this.blockStatus.length > 0 && this.blockStatus.length == this.chosenBlocks.length)
        return this.blockStatus[this.blockStatus.length - 1] == 'success'

      return false
    }
  },
  data( ) {
    return {
      initInput: "",
      isLoading: false,
      
      id: "",
      processor: Object,

      blocks: [ ],

      blockStatus: [ ],
      blockOutput: [ ],
      
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

      if (this.reRun)
      {
        this.blockOutput.splice(0, this.blockOutput.length)
        this.blockStatus.splice(0, this.blockStatus.length)
      }
      else if (this.blockStatus.length > 0)
      {
        i = this.blockStatus.filter(x => x == 'success').length

        if (i > 0)
          blockInput = this.blockOutput[i - 1]

        this.blockOutput.splice(i, this.blockOutput.length - i)
        this.blockStatus.splice(i, this.blockStatus.length - i)
      }

      for (; i < this.chosenBlocks.length; i++)
      {
        this.blockStatus.push('running')

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
              try
              {
                let result = await this.callLambda( this.chosenBlocks[i].function, bucket, params )
                if (result.data.constructor === Array)
                  output.push(...result.data)
                else
                  output.push(result.data)
              }
              catch (err)
              {
                this.blockStatus.pop()
                this.blockStatus.push('error')
                this.blockOutput.push(err.response.data)
                return
              }

              bucket = [ ]
            }
          }

          if ( bucket.length > 0 ) {
            try
            {
              let result = await this.callLambda( this.chosenBlocks[i].function, bucket, params )

              if (result.data.constructor === Array)
                output.push(...result.data)
              else
                output.push(result.data)
            }
            catch (err) 
            {
              this.blockStatus.pop()
              this.blockStatus.push('error')
              this.blockOutput.push(err.response.data)
              return
            }

            bucket = [ ]
          }

          this.blockStatus.pop()
          this.blockStatus.push('success')
          this.blockOutput.push(output)
          blockInput = output
        }
        else
        {
          try
          {
            let result = await this.callLambda( this.chosenBlocks[i].function, blockInput, params )
            this.blockStatus.pop()
            this.blockStatus.push('success')
            this.blockOutput.push(result.data)
            blockInput = result.data
          }
          catch (err) 
          {
            this.blockStatus.pop()
            this.blockStatus.push('error')
            this.blockOutput.push(err.response.data)
            return
          }
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
      {
        this.chosenBlocks.push( sender )
        this.blockParams.push({})
      }
      this.updateBlock ( );
    },

    removeBlock ( index ) {
      this.blockOutput.splice(index, this.blockOutput.length - index)
      this.blockStatus.splice(index, this.blockStatus.length - index)

      this.blockParams.splice(index, 1)
      this.chosenBlocks.splice(index, 1)
      this.updateBlock ( );
    },

    updateParam ( payload ) {
      this.blockOutput.splice(payload.index, this.blockOutput.length - payload.index)
      this.blockStatus.splice(payload.index, this.blockStatus.length - payload.index)

      this.blockParams[payload.index] = Object.assign({}, ...
        Object.entries(payload.params).filter(([k,v]) => {
          if (typeof v == 'boolean')
            return v
          
          return Object.keys(v).length > 0
        }).map(([k,v]) => ({[k]:v}))
      )
      this.updateBlock ( );
    },

    updateBlock ( ) {
      this.$store.dispatch('updateProcessor',
        {
          _id: this.id,
          name: this.name,
          description: this.description,
          blocks: this.chosenBlocks,
          params: this.blockParams,
        }
      )
    },

    async loadBlocks ( ) {
      let lambdas = this.$store.state.blocks

      this.blocks.splice(0, this.blocks.length)
      for(let i = 0; i < lambdas.length; i++)
      {
        await Axios({
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
      
      this.blocks.sort((x, y) => (x.name > y.name) ? 1 : -1)
      console.log( 'loaded blocks' )
    },
  },
  async activated( ) {
    this.isLoading = true;

    await this.loadBlocks()

    this.id = this.$route.params.processorId

    if (this.id == 'import')
    {
      this.processor = await this.$store.dispatch('createProcessor', JSON.parse(atob(this.$route.query.processor)) )
      this.id = this.processor._id
      this.$router.replace( `${this.id}` )
    }
    else
    {
      this.processor = await this.$store.dispatch('getProcessor', { _id: this.id })
    }

    console.log( 'activated' )

    this.isLoading = false;
  },
  deactivated( ) {
    this.blockStatus.splice(0, this.blockStatus.length) 
    this.blockOutput.splice(0, this.blockOutput.length) 
    
    console.log( 'de-activated' )
  },
}
</script>
<style scoped lang='scss'>
</style>
