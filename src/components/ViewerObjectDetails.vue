<template>
  <div class='transparent'>
    <vue-json-pretty :data='json' :deep='1' highlight-mouseover-node show-length :show-line='false' :show-double-quotes='false'></vue-json-pretty>
    <br>
    <v-divider></v-divider>
    <br>
  </div>
</template>
<script>
import VueJsonPretty from 'vue-json-pretty'

export default {
  name: 'ObjectDetails',
  components: { VueJsonPretty },
  props: {
    json: Object,
  },
  computed: {},
  data( ) {
    return {}
  },
  methods: {}
}

</script>
<style lang='scss'>
.vjs-tree.is-mouseover {
  background-color: rgba(255, 0, 0, 0.001) !important;
}

.vjs-tree {
  font-size: 12px !important;
}

.vjs-tree:hover {
  background-color: rgba(230, 247, 255, 0.02) !important;
}

</style>
