<template>
  <v-card ma-0 pa-0 flat>
    <v-card-title>
      <v-icon class="mr-2">
        {{block.icon ? block.icon : 'code'}}
      </v-icon>
      <span class='title font-weight-light'>
        {{ block.name }}
      </span>
      <v-spacer></v-spacer>
      <span>
        <v-dialog
          v-if="output != null"
          max-width="500">
          <template v-slot:activator="{ on }">
            <v-btn fab small dark depressed v-on="on" :color="status == 'success' ? 'green' : 'red'">
              <v-icon>{{status == "success" ? "check" : "warning"}}</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class='font-weight-light'>
                {{status == "error" ? "Error" : "Response"}}
              </span>
            </v-card-title>
            <v-card-text>
              <vue-json-pretty :data='responseObject' :deep='0' highlight-mouseover-node show-length :show-line='false' :show-double-quotes='false'>
              </vue-json-pretty>
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-btn fab small depressed @click="$emit('remove-block', index)">
          <v-icon>close</v-icon>
        </v-btn>
      </span>
    </v-card-title>
    <v-card-text v-if="this.block.parameters.length > 0">
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
        <v-flex xs12 sm12 md12 v-for='param in objectarrayParams' :key='param.name'>
          <v-toolbar>
          <v-toolbar-title>{{param.name}}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-dialog :persistent='true' v-model="displayDialog[param.name]" max-width='300'>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on">
                <v-icon fab>add</v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title class='title font-weight-light'>
                {{objectArrayIndex == -1 ? 'New Entry' : 'Modify Entry'}}
              </v-card-title>
              <v-card-text>
                <v-layout row wrap>
                  <v-flex xs12 sm12 md12 v-for='header in param.headers' :key='param.name + "_" + header'>
                    <v-text-field :label='header' v-model='objectArrayItem[header]'>
                    </v-text-field>
                  </v-flex>
                </v-layout>
              </v-card-text>
              <v-card-actions>
                <v-btn flat color='primary' @click='addObjectArrayItem(param)'>
                  {{objectArrayIndex == -1 ? 'Add' : 'Modify'}}
                </v-btn>
                <v-btn flat color='primary' @click='resetObjectArrayDialog(param)'>
                  Cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          </v-toolbar>
          <v-data-table disable-initial-sort class="elevation-1" hide-actions :headers='tableHeader(param.headers)' :items='params[param.name]'>
            <template v-slot:items="props">
              <td v-for='p in Object.entries(props.item)' :key='p[0]'>{{p[1]}}</td>
              <td width='200px'>
                <v-btn flat icon small @click="deleteObjectArrayItem(param, props.index)">
                  <v-icon small>
                    delete
                  </v-icon>
                </v-btn>
                <v-btn flat icon small @click="editObjectArrayItem(param, props.index)">
                  <v-icon small>
                    edit
                  </v-icon>
                </v-btn>
              </td>
            </template>
            <template v-slot:no-data>
              <td v-for='h in param.headers' :key='h'></td>
              <td width='10%'></td>
            </template>
          </v-data-table>
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
    params: { },
  },
  computed: {
    arrayParams( ) {
      return this.block.parameters.filter(p => p.type == 'array')
    },
    stringParams( ) {
      return this.block.parameters.filter(p => p.type == 'string')
    },
    booleanParams( ) {
      return this.block.parameters.filter(p => p.type == 'boolean')
    },
    objectarrayParams( ) {
      return this.block.parameters.filter(p => p.type == 'objectarray')
    },
    responseObject() {
      return this.removeArraysRecursive( this.output )
    }
  },
  data( ) {
    return {
      displayDialog: { },
      objectArrayItem: { },
      objectArrayIndex: -1,
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
    },
    tableHeader( headers ) {
      var formatedHeaders = [ ]
      headers.forEach(h => {
        formatedHeaders.push({text: h, value: h, sortable: false})
      })
      formatedHeaders.push({text: 'actions', value: 'actions', sortable: false})
      return formatedHeaders
    },
    resetObjectArrayDialog (param) {
      this.objectArrayItem = { }
      this.displayDialog[param.name] = false
      this.objectArrayIndex = -1
    },
    addObjectArrayItem (param) {
      if (Object.values(this.objectArrayItem).length == param.headers.length)
      {
        if (!this.params.hasOwnProperty(param.name)) this.params[param.name] = []

        if (this.objectArrayIndex == -1)
          this.params[param.name].push(this.objectArrayItem)
        else
          this.params[param.name].splice(this.objectArrayIndex, 1, this.objectArrayItem)
        this.objectArrayItem = { }
        this.$emit('update-param', {index: this.index, params: this.params})
      }
      this.resetObjectArrayDialog(param)
    },
    deleteObjectArrayItem (param, index) {
      this.params[param.name].splice(index, 1)
      this.$emit('update-param', {index: this.index, params: this.params})
    },
    editObjectArrayItem (param, index) {
      this.objectArrayItem = Object.assign({}, this.params[param.name][index])
      this.objectArrayIndex = index
      this.displayDialog[param.name] = true
    }
  },
  created () {
  }
}
</script>
<style scoped lang='scss'>
</style>
