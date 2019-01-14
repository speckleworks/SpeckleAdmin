<template>
  <div class='md-layout' style="height:100%">
    <div class="view-part-data md-layout-item md-size-20">
      <p>Streams</p>

    </div>
    <div class="view-part-render md-layout-item md-size-80" ref='render'></div>
    <!-- <h1>Hello Viewer.</h1> -->
  </div>
</template>
<script>
import HelloWorld from '@/components/HelloWorld.vue'
import SpeckleRenderer from '@/renderer/SpeckleRenderer.js'

export default {
  name: 'ViewerView',
  components: {},
  computed: {},
  methods: {},
  data( ) {
    return {
      renderer: null
    }
  },
  mounted( ) {
    console.log( 'viewer created' )
    console.log( this.$refs.render )
    this.renderer = new SpeckleRenderer( { domObject: this.$refs.render } )
    this.renderer.animate( )
  }
}

</script>
<style scoped lang='scss'>
.view-part-render {
  background: #E0EAFC;
  /* fallback for old browsers */
  background: -webkit-linear-gradient(to top, #CFDEF3, #E0EAFC);
  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to top, #CFDEF3, #E0EAFC);
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */


}

</style>
