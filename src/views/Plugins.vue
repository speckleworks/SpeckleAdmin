<template>
  <v-container grid-list-xl>
    <v-layout row wrap>
      <v-flex xs12 pt-5 pb-0>
        <div class="title font-weight-light">
          Plugins & Integrations: <a target="_blank" href='https://github.com/speckleworks/speckleinstaller/releases/latest'>Dynamo, Grasshopper and Rhino</a>
        </div>
        <p class='my-2'>
          The above come bundled with an installer which you can <a target="_blank" href='https://github.com/speckleworks/speckleinstaller/releases/latest'>download from here</a>.
          <br>&nbsp
        </p>
        <p class='title font-weight-light'>
          <a target="_blank" href="https://github.com/speckleworks/SpeckleBlender">Blender</a>, <a target="_blank" href="https://github.com/speckleworks/SpeckleUnity">Unity</a>, Grevit/Revit and others
        </p>
        <p>
          Blender integration is available <a target="_blank" href="https://github.com/speckleworks/SpeckleBlender">from here</a>. Unity is found <a target="_blank" href="https://github.com/speckleworks/SpeckleUnity">here</a>. Many other "in-development" plugins are <a target="_blank" href="https://github.com/speckleworks">under heavy construction on github</a>. If you have the time, do help along!
        </p>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
export default {
  name: 'PluginsView',
  computed: {},
  data( ) {
    return {

    }
  },
  methods: {},
  mounted( ) {

  }
}

</script>
<style scoped lang='scss'>
</style>
