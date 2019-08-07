<template>
  <v-layout row wrap>
    <v-list>
        <v-switch color="primary" v-model="showEdges" label="Show Edges"></v-switch>
        <v-switch color="primary" v-model="castShadows" label="Shadows"></v-switch>
        <v-slider min='0' max='100' v-model='meshMaterialOpacity' label='Opacity'/>
        <v-slider min='0' max='100' v-model='meshMaterialSpecular' label='Specular'/>
        </v-list-group>
    </v-list>
  </v-layout>
</template>
<script>
export default {
  name: "ViewerSettings",
  computed: {
    showEdges: {
      get () {
        return this.$store.state.viewer.showEdges
      },
      set (value) {
        this.$store.commit("TOGGLE_EDGES", value )
        this.$emit('update')
      }
    },
    castShadows: {
      get () {
        return this.$store.state.viewer.castShadows
      },
      set( value ){
        this.$store.commit( "TOGGLE_SHADOWS", value )
        this.$emit('update')
      }
    },
    meshMaterialOpacity: {
      get () {
        return this.$store.state.viewer.meshMaterial.opacity
      },
      set ( value ) {
        this.$store.commit( "SET_MESH_OPACITY", value )
        this.$emit('update')
      }
    },
    meshMaterialSpecular: {
      get () {
        return this.$store.state.viewer.meshMaterial.specular
      },
      set ( value ) {
        this.$store.commit( "SET_MESH_SPECULAR", value )
        this.$emit('update')
      }
    }
  },
  data() {
    return {
    }
  },
  watch: {
    showEdges() {
      
    },
    castShadows() {
    }
  }
}
</script>
<style scoped>
.v-input--selection-controls{
  margin-top:0px;
}
</style>


