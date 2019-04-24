<template>
  <v-container fluid fill-height pa-0>
    <v-layout row style='height:100%;'>
      <v-flex xs6 md4 lg5 xxstyle='height:100%;'>
        Controls
      </v-flex >
      <v-flex xs6 md8 lg7 class='elevation-1'>
        renderer
      </v-flex>
    </v-layout>
    <!--     <v-navigation-drawer stateless floating width='400' stateless value="true" class='xxxtransparent'>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card>
            <stream-search></stream-search>
          </v-card>
        </v-flex>
      </v-layout>
    </v-navigation-drawer> -->
  </v-container>
</template>
<script>
// import SearchEverything from '@/components/SearchEverything.vue'
import StreamSearch from '@/components/StreamSearch.vue'

export default {
  name: 'ViewerView',
  components: { StreamSearch },
  computed: {},
  methods: {},
  data( ) {
    return {}
  },
  activated( ) {
    console.log( 'activated' )
  },
  mounted( ) {
    console.log( 'mounted' )
  }
}

</script>
<style scoped lang='scss'>
</style>
