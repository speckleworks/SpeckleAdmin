<template>
  <v-container grid-list-xl>
    <v-layout row wrap>
      <v-flex xs12 py-5 class='headline font-weight-light'>
        Plugins are web applications that interact with your Speckle Server. <br>This page is part of the SpeckleAdmin plugin!
      </v-flex>
      <!-- Empty state handler -->
      <v-flex xs12 v-if='plugins.length === 0'>
        <p class='title font-weight-light'>Hmm, we didn't find any plugins... Which is odd since this page is part of the SpeckleAdmin plugin. 🤔
        </p>
      </v-flex>
      <v-flex xs12 sm6 v-for='(plugin, index) in plugins' :key='index'>
        <plugin-card :plugin='plugin'></plugin-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>

import PluginCard from '../components/PluginCard'

export default {
  name: 'Plugins',
  components: {
    PluginCard
  },
  data: ( ) => ({
  }),
  computed: {
    plugins ( ) { return this.$store.state.plugins }
  },
  mounted() {
    this.$store.dispatch( 'getPlugins' )
  }
}
</script>