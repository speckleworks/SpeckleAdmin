<template>
  <v-container grid-list-xl>
    <div style='position: absolute; top:0; left: 0; width: 100%;'>
      <v-progress-linear :indeterminate="true" v-show='!processor' height='2' class='ma-0'></v-progress-linear>
    </div>
    <v-layout row wrap v-if="processor">
      <v-flex xs12>
        <v-card class="pa-3">
          <v-layout row wrap>
            <v-flex xs12 class='display-1 font-weight-light text-capitalize my-5'>
              <editable-span :text='processor.name' @update='updateName'></editable-span>
            </v-flex>
            <v-flex xs12 class='ma-0 py-0 mb-2'>
              <v-combobox :menu-props='{"maxHeight":0, "zIndex":"0"}' @input='updateTags' v-model="processor.tags" :items='processor.tags' hint='add or remove tags' solo persistent-hint small-chips deletable-chips multiple tags>
                <template v-slot:no-data>processor has no tags.</template>
              </v-combobox>
            </v-flex>
          </v-layout>
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
                  <span class='font-weight-light'>
                    Share link
                  </span>
                </v-card-title>
                <v-card-text>
                  <v-text-field :readonly="true" v-model="shareLink" class='font-weight-light'></v-text-field>
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex xs12>
        <v-card class="my-4">
          <detail-description :resource='processor'></detail-description>
        </v-card>
      </v-flex>
      <v-flex>
        <v-card>
          <v-flex class="pa-4">
            <v-icon class="mr-2">
              code
            </v-icon>
            <span class='title font-weight-light mr-2'>
              Processor
            </span>
          </v-flex>
          <v-divider></v-divider>
          <template>
            <v-flex xs12 ma-0 pa-0 v-for='(block, index) in processor.blocks' :key='index'>
              <processor-block
                :index='index'
                :block='block'
                :output='blockOutput[index]'
                :status='blockStatus[index]'
                :params='processor.params[index]'
                v-on:remove-block="removeBlock"
                v-on:update-param="updateParam"/>
            </v-flex>
          </template>
          <v-flex xs12>
            <v-select
              return-object
              :items="lambdas"
              v-on:input="addBlock"
              label="Add new block">
              <template slot="selection">
                {{null}}
              </template>
              <template slot="item" slot-scope="lambdas">
                <v-icon class="mr-2">
                  {{lambdas.item.icon ? lambdas.item.icon : 'code'}}
                </v-icon>
                {{lambdas.item.name}}
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

import debounce from 'lodash.debounce'
import ProcessorBlock from '../components/ProcessorBlock.vue'
import DetailDescription from '../components/DetailDescription.vue'

import Axios from 'axios'

export default {
  name: 'ProcessorView',
  components: {
    ProcessorBlock,
    DetailDescription,
  },
  computed: {
    lambdas: function() {
      return this.$store.state.lambdas
    },
    shareLink: function() {
      let copy = Object.assign({}, this.processor)

      delete copy._id
      delete copy.owner
      delete copy.private
      delete copy.canRead
      delete copy.canWrite
      delete copy.anonymousComments
      delete copy.comments

      return window.location.origin + "/#/processors/import?processor=" + btoa(JSON.stringify(copy))
    },
    reRun: function () {
      if (this.blockStatus.length > 0 && this.blockStatus.length == this.processor.blocks.length)
        return this.blockStatus[this.blockStatus.length - 1] == 'success'

      return false
    }
  },
  data( ) {
    return {
      initInput: "",

      id: "",
      processor: null,

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

      for (; i < this.processor.blocks.length; i++)
      {
        this.blockStatus.push('running')

        var params = this.processor.params[i] ? this.processor.params[i] : new Object
        
        if (this.processor.blocks[i].allowBucketing && blockInput.constructor === Array)
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
                let result = await this.callLambda( this.processor.blocks[i].function, bucket, params )
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
              let result = await this.callLambda( this.processor.blocks[i].function, bucket, params )

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
            let result = await this.callLambda( this.processor.blocks[i].function, blockInput, params )
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
        this.processor.blocks.push( sender )
        this.processor.params.push({})
      }
      this.updateBlock ( );
    },

    removeBlock ( index ) {
      this.blockOutput.splice(index, this.blockOutput.length - index)
      this.blockStatus.splice(index, this.blockStatus.length - index)

      this.processor.params.splice(index, 1)
      this.processor.blocks.splice(index, 1)
      this.updateBlock ( );
    },

    updateParam ( payload ) {
      this.blockOutput.splice(payload.index, this.blockOutput.length - payload.index)
      this.blockStatus.splice(payload.index, this.blockStatus.length - payload.index)

      this.processor.params[payload.index] = Object.assign({}, ...
        Object.entries(payload.params).filter(([k,v]) => {
          if (typeof v == 'boolean')
            return v
          
          return Object.keys(v).length > 0
        }).map(([k,v]) => ({[k]:v}))
      )
      this.updateBlock ( );
    },

    updateName( args ) {
      this.$store.dispatch( 'updateProcessor', { _id: this.id, name: args.text } )
    },

    updateTags: debounce( function( e ) {
      this.$store.dispatch( 'updateProcessor', { _id: this.id, tags: this.processor.tags } )
    }, 1000 ),

    updateBlock ( ) {
      this.$store.dispatch('updateProcessor',
        {
          _id: this.id,
          blocks: this.processor.blocks,
          params: this.processor.params,
        }
      )
    },
  },
  activated( ) {
    this.id = this.$route.params.processorId

    if (this.id == 'import')
    {
      var parsed = null
      try
      {
        parsed = JSON.parse(atob(this.$route.query.processor))
      }
      catch
      {
        console.log( 'failed to import' )
        this.$router.push( `/processors/` )
      }

      if (parsed)
        this.$store.dispatch( 'createProcessor', parsed )
          .then( res => {
            this.processor = res
            this.id = this.processor._id
            this.$router.replace( `${this.id}` )

            console.log( 'activated' )
            this.isLoading = false
          })
          .catch( err => {
            console.log( 'failed to import' )
            this.$router.push( `/processors/` )
          })
    }
    else
    {
      this.$store.dispatch('getProcessor', { _id: this.id })
        .then( res => {
          if (res == null)
            this.$router.push( `/processors/` )
          
          this.processor = res

          console.log( 'activated' )
        })
    }
  },
  deactivated( ) {
    this.processor = null

    this.blockStatus.splice(0, this.blockStatus.length) 
    this.blockOutput.splice(0, this.blockOutput.length) 
    
    console.log( 'de-activated' )
  },
}
</script>
<style scoped lang='scss'>
</style>
