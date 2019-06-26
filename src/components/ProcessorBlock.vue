<template>
  <v-card>
    <v-card-title>
      <span class='title font-weight-light'>
        {{ index + 1 }} : {{ block.name }}
      </span>
      <v-spacer></v-spacer>
      <span>
        <v-btn icon @click="$emit('remove-block', index)">
          <v-icon>close</v-icon>
        </v-btn>
      </span>
    </v-card-title>
    <v-flex xs12 sm6 md3 v-if="this.block.parameters.length > 0">
      <v-text-field  v-for='param in block.parameters' :key='param.name' :label='param.name' v-model='params[param.name]' @change="$emit('update-param', {index: index, params: params})">
      </v-text-field>
    </v-flex>
    <v-alert
      :value="true"
      v-bind:type="alertState"
      v-if="JSON.stringify(output) != null">
      <span v-if="JSON.stringify(output).length<100"> {{ JSON.stringify(output) }} </span>
      <span v-else> {{ JSON.stringify(output).substring(0,100) + "..." }} </span>
    </v-alert>
  </v-card>
</template>
<script>
export default {
  name: 'ProcessorBlock',
  props: {
    index: null,
    block: Object,
    output: null,
    successRun: null,
  },
  computed: {
    alertState( ) {
      return this.successRun ? "success" : "error"
    }
  },
  data( ) {
    return {

    }
  },
  methods: {
  },
  created () {
    this.params = { }
  }
}
</script>
<style scoped lang='scss'>
</style>
