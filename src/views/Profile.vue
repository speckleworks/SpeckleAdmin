<template>
  <div>
    <h1 class='md-display-1'>Hello, {{$store.state.user.name}}!</h1>
    <md-button class='no-margin md-raised' @click.native='logout'>Logout</md-button>
<!--     <p>You look like this:</p>
    <pre>
      {{$store.state.user}}
    </pre> -->
  </div>
</template>
<script>
export default {
  name: 'ProfileView',
  computed: {},
  data( ) {
    return {

    }
  },
  methods: {
    logout( ) {
      this.$store.dispatch( 'logout' )
      this.$router.push( '/' )
    }
  },
  mounted( ) {

  }
}

</script>
<style scoped lang='scss'>
</style>
