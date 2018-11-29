<template>
  <div>
    <h1 class='md-display-1'>Hello streams.</h1>
    <p>Streams are the basic building block of speckle.</p>
  </div>
</template>
<script>
export default {
  name: '',
  computed: {},
  data( ) {
    return {

    }
  },
  methods: {},
  created( ) {
    console.log( 'H' )
    this.$http.get( 'streams?omit=objects,layers&isComputedResult=false&deleted=false' )
    .then( res => {
      console.log( res )
    })
    .catch(err => {

    })
  }
}

</script>
<style scoped lang='scss'>
</style>
