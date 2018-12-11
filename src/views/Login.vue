<template>
  <md-content class='md-layout md-alignment-center-center md-primary' style="min-height: 100%">
    <form class="md-layout-item md-size-25 md-small-size-100 md-medium-size-50" @submit.prevent='login'>
      <md-card class="md-elevation-3">
        <md-card-header v-if='!$store.state.isAuth'>
          <md-card-header-text>
            <div class="md-title">Login</div>
            <div class="md-caption">at <strong><a :href='$store.state.server' target="_blank">{{$store.state.serverManifest.serverName}}</a></strong>. Do you want to <router-link to='/register'>register</router-link>?</div>
          </md-card-header-text>
        </md-card-header>
        <md-card-content v-if='!$store.state.isAuth'>
          <md-field>
            <label>Email adress</label>
            <md-input v-model='email' name='email'></md-input>
          </md-field>
          <md-field>
            <label>Password</label>
            <md-input v-model='password' type="password" name='password'></md-input>
          </md-field>
        </md-card-content>
        <md-card-actions v-if='!$store.state.isAuth'>
          <md-button type="submit" class="md-primary md-raised">Login</md-button>
        </md-card-actions>
        <br>
        <speckle-alert type='error' v-on:closed='showError=false' v-show='showError'>
          {{errorMessage}}
        </speckle-alert>
      </md-card>
    </form>
  </md-content>
</template>
<script>
import SpeckleAlert from '../components/SpeckleAlert.vue'

export default {
  name: 'LoginView',
  components: {
    SpeckleAlert
  },
  computed: {},
  data( ) {
    return {
      email: null,
      password: null,
      errorMessage: null,
      showError: false
    }
  },
  methods: {
    login( ) {
      console.log( this.$route.params )
      this.$store.dispatch( 'login', { email: this.email, password: this.password } )
        .then( res => {
          console.log( 'yas!' )
          if ( this.$route.params.redirectTo !== null && this.$route.params.redirectTo !== undefined ) {
            let redirectTo = atob( this.$route.params.redirectTo )
            this.$router.push( redirectTo )
            this.password = null
          } else
            this.$router.push( '/' )
        } )
        .catch( err => {
          console.log( err )
          this.errorMessage = `Failed to log in.`
          this.showError = true
        } )
    }
  },
  mounted( ) {
    if ( this.$store.state.isAuth === true ) {
      this.errorMessage = 'You are already logged in!'
      this.showError = true
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
