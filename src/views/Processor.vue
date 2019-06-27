<template>
  <v-container grid-list-xl>
    <div style='position: absolute; top:0; left: 0; width: 100%;'>
      <v-progress-linear :indeterminate="true" v-show='isLoading' height='2' class='ma-0'></v-progress-linear>
    </div>
    <v-layout row wrap>
      <v-flex xs12 pt-5 pb-0 class='headline font-weight-light'>
        Processor allows you to run scripts on streams.
      </v-flex>
      <v-flex>
        <v-card>
          <template v-if="!isLoading">
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

      blocks: [ ],

      chosenBlocks: [ ],
      blockStatus: [ ],
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
      this.appendQueryToRoute()
    },

    removeBlock ( index ) {
      this.blockOutput.splice(index, this.blockOutput.length - index)
      this.blockStatus.splice(index, this.blockStatus.length - index)

      this.blockParams.splice(index, 1)
      this.chosenBlocks.splice(index, 1)
      
      this.appendQueryToRoute()
    },

    updateParam ( payload ) {
      this.blockOutput.splice(payload.index, this.blockOutput.length - payload.index)
      this.blockStatus.splice(payload.index, this.blockStatus.length - payload.index)

      this.blockParams[payload.index] = Object.assign({}, ...
        Object.entries(payload.params).filter(([k,v]) => {
          if (v.constructor === Array)
            return v.length > 0

          if (typeof v == 'string')
            return v.length > 0

          if (typeof v == 'boolean')
            return v
        }).map(([k,v]) => ({[k]:v}))
      )
      
      this.appendQueryToRoute()
    },

    async loadBlocks ( ) {
      let lambdas = this.$store.state.blocks

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

    fetchBlocksFromRoute( ) {
      if ( this.$route.query.blocks ) {
        let blocks = this.$route.query.blocks.split( ',' )
        blocks.forEach(block => {
          let match = this.blocks.filter(x => x.function == block)[0]
          if (match != null)
            this.chosenBlocks.push( match )
        })
      }
    },

    fetchParamsFromRoute( ) {
      for (let i = 0; i < this.chosenBlocks.length; i++)
      {
        if (this.$route.query['params_' + i.toString()])
          this.blockParams.push(Object.assign({}, ...
            Object.entries(JSON.parse(this.$route.query['params_' + i.toString()])).filter(([k,v]) => {
              if (v.constructor === Array)
                return v.length > 0

              if (typeof v == 'string')
                return v.length > 0

              if (typeof v == 'boolean')
                return v
            }).map(([k,v]) => ({[k]:v}))
          ))
        else
          this.blockParams.push({})
      }
    },

    appendQueryToRoute( ) {
      if (this.isLoading) return

      let query = { }

      let blocks = this.chosenBlocks.map(x => x.function).join( ',' )
      if ( blocks !== '' )
        query['blocks'] = blocks
      
      for (let i = 0; i < this.blockParams.length; i++)
      {
        if (this.blockParams.length > i && Object.keys(this.blockParams[i]).length > 0)
        {
          let param = JSON.stringify(this.blockParams[i])
          query['params_' + i.toString()] = param
        }
      }

      if ( Object.keys(query).length > 0 )
        this.$router.replace( { name: 'processor', query: query } )
      else this.$router.replace( { name: 'processor' } )
    },
  },

  async mounted( ) {
    this.isLoading = true;

    await this.loadBlocks()

    this.fetchBlocksFromRoute()
    this.fetchParamsFromRoute()

    this.isLoading = false;

    this.appendQueryToRoute()

    console.log( 'mounted' )
  }
}
</script>
<style scoped lang='scss'>
</style>
