<template>
  <v-card>
    <v-card-title>
      <span class='title font-weight-light'>
        {{ block.name }}
      </span>
      <v-spacer></v-spacer>
      <span>
        <v-dialog
          v-if="output != null"
          max-width="500">
          <template v-slot:activator="{ on }">
            <v-btn fab small dark v-on="on" :color="dialogColor">
              <v-icon>{{popUpIcon}}</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class='title font-weight-light'>
                {{status == "error" ? "Error" : "Response"}}
              </span>
            </v-card-title>
            <v-card-text>
              <vue-json-pretty :data='responseObject' :deep='0' highlight-mouseover-node show-length :show-line='false' :show-double-quotes='false'>
              </vue-json-pretty>
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-btn icon @click="$emit('remove-block', index)">
          <v-icon>close</v-icon>
        </v-btn>
      </span>
    </v-card-title>
    <v-card-text>
      <v-layout row wrap v-if="this.block.parameters.length > 0">
        <v-flex xs12 sm6 md3 v-for='param in arrayParams' :key='param.name'>
          <v-combobox multiple small-chips :label='param.name' v-model='params[param.name]' @change="$emit('update-param', {index: index, params: params})">
          </v-combobox>
        </v-flex>
        <v-flex xs12 sm6 md3  v-for='param in stringParams' :key='param.name'>
          <v-text-field :label='param.name' v-model='params[param.name]' @change="$emit('update-param', {index: index, params: params})">
          </v-text-field>
        </v-flex>
        <v-flex xs12 sm6 md3 v-for='param in booleanParams' :key='param.name'>
          <v-checkbox :label='param.name' v-model='params[param.name]' @change="$emit('update-param', {index: index, params: params})">
          </v-checkbox>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-progress-linear
      color='primary'
      v-bind:indeterminate="this.status == 'running'">
    </v-progress-linear>
  </v-card>
</template>
<script>

import VueJsonPretty from 'vue-json-pretty'

export default {
  name: 'ProcessorBlock',
  components: {
    VueJsonPretty
  },
  props: {
    index: null,
    block: Object,
    output: null,
    status: '',
  },
  computed: {
    popUpIcon( ) {
      if (this.status == "success") return "check"
      else if (this.status == "error") return "error"
    },
    dialogColor( ){
      if (this.status == "success") return "green"
      else if (this.status == "error") return "red"
    },
    arrayParams( ) {
      return this.block.parameters.filter(p => p.type == 'array')
    },
    stringParams( ) {
      return this.block.parameters.filter(p => p.type == 'string')
    },
    booleanParams( ) {
      return this.block.parameters.filter(p => p.type == 'boolean')
    },
    responseObject() {
      return this.removeArraysRecursive( this.output )
    }
  },
  data( ) {
    return {

    }
  },
  methods: {
    removeArraysRecursive( foo ) {
      let bar = {}

      if (typeof foo == 'string')
        return foo

      for ( let key in foo ) {
        if ( !foo.hasOwnProperty( key ) ) continue

        if ( Array.isArray( foo[ key ] ) ) {
          /*DO FUCKALL */
          if( foo[key].length < 3 )
            bar[key] = foo[key]
          else {
            bar[key] = [ ...foo[key].slice(0, 3), `... (${foo[key].length - 3} more values)` ]
          }
        } else if ( typeof foo[ key ] === 'object' && foo[ key ] !== null ) {
          bar[ key ] = this.removeArraysRecursive( foo[ key ] )
        } else {
          bar[ key ] = foo[ key ]
        }
      }
      return bar
    }
  },
  created () {
    this.params = { }
  }
}
</script>
<style scoped lang='scss'>
</style>
