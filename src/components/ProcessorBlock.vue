<template>
  <v-card>
    <v-card-title>
      <span class='title font-weight-light'>
        {{ index + 1 }} : {{ block.name }}
      </span>
      <v-spacer></v-spacer>
      <span>
        <v-dialog
          width="700">
          <template v-slot:activator="{ on }">
            <v-btn icon
            v-on="on">
              <v-icon>code</v-icon>
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class='title font-weight-light'>
                {{ block.name }}
              </span>
            </v-card-title>
            <v-card-text style="word-wrap: break-word">
              <pre>
                {{ block.script }}
              </pre>
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-btn icon @click="$emit('remove-block', index)">
          <v-icon>close</v-icon>
        </v-btn>
      </span>
    </v-card-title>
    <v-flex xs12 sm6 md3 v-if="Object.keys(params).length > 0">
      <v-text-field  v-for='param in block.params' :key='param' :label='param' v-model='params[param]' @change="$emit('update-param', {index, params})">
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
    this.params = Object.keys(this.block.params)
  }
}
</script>
<style scoped lang='scss'>
</style>
