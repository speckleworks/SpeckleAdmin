<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-autocomplete
        return-object
        :items="libraries"
        item-text="name"
        item-value="name"
        v-model="params.selectedLibrary"
        v-on:input="selectLibrary"
        :loading="libraries.length === 0"
        label="Select a library">
        <template slot="item" slot-scope="libraries">
          <div>
            {{libraries.item.name}}
            <br>
            <span class="caption">
              {{libraries.item.api}}
            </span>
          </div>
        </template>
      </v-autocomplete>
    </v-flex>

    <v-flex xs12 v-if="params.selectedLibrary">
      <v-autocomplete
        return-object
        :items="functions"
        item-text="name"
        item-value="name"
        v-model="params.selectedFunction"
        v-on:input="selectFunction"
        :loading="functions.length === 0"
        label="Select a library">
        <template slot="item" slot-scope="functions">
          <div>
            {{functions.item.name}}
            <br>
            <span class="caption">
              {{functions.item.api}}
            </span>
          </div>
        </template>
      </v-autocomplete>
    </v-flex>

    <v-flex v-if="params.selectedLibrary && params.selectedFunction && functions.length > 0" xs12>
      <v-card>
        <v-card-title>
          <span class='font-weight-light'>
            Inputs
          </span>
        </v-card-title>
        <v-divider/>
        <v-layout row wrap pa-3>
          <v-flex xs12 sm6 md3 v-for='input in params.selectedFunction.inputs' :key='input.name'>
            <v-text-field 
              :label='input.name'
              v-model='inputs[input.name]'
              :append-icon="isInputByValue(input.name) ? 'edit' : 'input'"
              :hint="isInputByValue(input.name) ? 'Input by value' : 'Input by object path'"
              :persistent-hint="true"
              @click:append="toggleInputSource({name: input.name, value: $event})"
              @change="updateInput({name: input.name, value: $event})">
            </v-text-field> 
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>

import Axios from 'axios'

export default {
  name: 'ProcessorBlock',
  components: {
  },
  props: {
    block: Object,
    params: { },
  },
  data( ) {
    return {
      libraries: [ ],
      functions: [ ],
    }
  },
  computed: {
    inputs () {
      return Object.assign({ }, this.params.valueData, this.params.pathData)
    }
  },
  methods: {
    selectLibrary ( payload ) {
      this.functions.slice(0, this.functions.length)
      
      Axios({
        method: 'GET',
        url: `${payload.api}?flat=true`,
        baseURL: `https://arupcompute-dev.azurewebsites.net/`,
      })
      .then ( res =>{
        this.functions = res.data
        this.functions.sort((x, y) => (x.name.toLowerCase() > y.name.toLowerCase()) ? 1 : -1)

        this.params.selectedLibrary = payload

        if (this.params.selectedFunction)
        {
          if (this.functions.findIndex(x => x.api === this.params.selectedFunction.api) === -1)
            this.params.selectedFunction = null
        }

        this.$emit('update-param', this.params)
      })
    },
    selectFunction ( payload ) {
      this.params.selectedFunction = payload

      this.params.valueData = {}
      this.params.pathData = {}

      this.$emit('update-param', this.params)
    },
    isInputByValue ( paramName ) {
      if (this.params.valueData)
        if (this.params.valueData.hasOwnProperty(paramName))
          return true

      return false
    },
    toggleInputSource ( payload ) {
      if (!this.params.pathData)
        this.params.pathData = {}

      if (!this.params.valueData)
        this.params.valueData = {}
        
      if (this.isInputByValue(payload.name))
      {
        this.params.pathData[payload.name] = this.params.valueData[payload.name]
        delete this.params.valueData[payload.name]
      }
      else
      {
        this.params.valueData[payload.name] = this.params.pathData[payload.name]
        delete this.params.pathData[payload.name]
      }

      this.$emit('update-param', this.params)
    },
    updateInput ( payload ) {
      if (!this.params.pathData)
        this.params.pathData = {}

      if (!this.params.valueData)
        this.params.valueData = {}
        
      if (this.isInputByValue(payload.name))
        this.params.valueData[payload.name] = payload.isInputByValue
      else
        this.params.pathData[payload.name] = payload.value

      this.$emit('update-param', this.params)
    }
  },
  created () {
    Axios({
      method: 'GET',
      url: `api`,
      baseURL: `https://arupcompute-dev.azurewebsites.net/`,
    })
    .then ( res =>{
      this.libraries = res.data
      this.libraries.sort((x, y) => (x.name.toLowerCase() > y.name.toLowerCase()) ? 1 : -1)
      
      if (this.params.selectedLibrary)
        this.selectLibrary (this.params.selectedLibrary)
    })
  }
}
</script>
<style scoped lang='scss'>
</style>