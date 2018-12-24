<template>
  <div class='md-layout'>
    <md-card class="md-elevation-0 md-layout-item md-size-100">
      <md-card-content>
        <h1 class='md-display-1'>Hello, {{$store.state.user.name}}!</h1>
        <md-button class='no-margin md-raised md-primary' @click.native='logout'>Logout</md-button>
      </md-card-content>
    </md-card>
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
