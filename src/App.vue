<template>
  <div class="page-container">
    <admin v-if='readySetGo' :server='server' :token='token' @successLogin='setLocalStorage'></admin>
  </div>
</template>
<script>
import Admin from './AdminInterface.vue'
import Store from './store/index'

export default {
  name: 'app',
  store: Store,
  components: {
    Admin
  },
  data( ) {
    return {
      server: null,
      token: null,
      readySetGo: false
    }
  },
  methods: {
    setLocalStorage( token ) {
      window.localStorage.setItem( 'token', token )
    }
  },
  mounted( ) {
    console.log( "app  mounted" )
    //if ( window.location.href.indexOf( 'dev' ) !== -1 )
    //  this.server = 'http://localhost:3000/api/v1'
    //else
      this.server = window.location.origin + '/api/v1'
    this.token = window.localStorage.getItem( 'token' )
    this.readySetGo = true
  }
}

</script>
<style lang="scss">


</style>
