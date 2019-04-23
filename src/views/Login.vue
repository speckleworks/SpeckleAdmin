<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs11 lg6>
        <form class="md-layout-item md-size-33 md-small-size-100 md-medium-size-50" @submit.prevent='login' v-if='$store.state.isAuth === false'>
          <v-card class="elevation-3">
            <v-toolbar class='title text-uppercase elevation-0'>
              <span>Login&nbsp;&nbsp;</span>
              <v-spacer></v-spacer>
              <span class='font-weight-light caption'>or <router-link to='/register'>register</router-link>?</span>
            </v-toolbar>
            <v-card-text>
              <v-text-field prepend-inner-icon='developer_board' hint='server url' type="url" v-model='server' name='server' @blur='checkServer'></v-text-field>
              <v-text-field :rules="emailRules" prepend-inner-icon='email' type="email" v-model='email' name='email' label='your email'></v-text-field>
              <v-text-field prepend-inner-icon='lock' v-model='password' type="password" name='password' label='your password'></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn type="submit" class="md-primary md-raised">Login</v-btn>
            </v-card-actions>
            <v-alert v-model="showError" type="warning" dismissible>
              {{errorMessage}}
            </v-alert>
          </v-card>
        </form>
        <v-card v-else>
          <v-card-text>You are already logged in.</v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import Axios from 'axios'

export default {
  name: 'LoginView',
  components: {
  },
  computed: {},
  watch: {},
  data( ) {
    return {
      server: null,
      email: null,
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test( v ) || 'E-mail must be valid'
      ],
      password: null,
      errorMessage: null,
      showError: false,
      serverOk: false
    }
  },
  methods: {
    login( ) {
      this.$store.dispatch( 'login', { email: this.email, password: this.password } )
        .then( res => {
          console.log( 'Logged in.' )
          this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&deleted=false&sort=-lastModified' )
          this.$store.dispatch( 'getProjects' )
          if ( this.$route.params.redirectTo !== null && this.$route.params.redirectTo !== undefined ) {
            let redirectTo = atob( this.$route.params.redirectTo )
            this.$router.push( redirectTo )
            this.password = null
          } else
            this.$router.push( '/' )
        } )
        .catch( err => {
          console.log( err )
          console.log( "login error" )
          this.errorMessage = `Failed to log in.`
          this.showError = true
        } )
    },
    checkServer( ) {
      if ( !this.server.includes( 'api' ) )
        this.server += '/api'
      Axios.get( this.server )
        .then( res => {
          if ( !res.data.hasOwnProperty( 'serverName' ) )
            throw new Error( 'Failed to get server.' )
          this.serverOk = true
          this.errorMessage = ``
          this.showError = false
          this.$store.commit( 'SET_SERVER', this.server )
          this.$store.commit( 'SET_SERVER_DETAILS', res.data )
          localStorage.setItem( 'server', this.server )
          Axios.defaults.baseURL = this.server
        } )
        .catch( err => {
          this.serverOk = false
          this.errorMessage = `Server url is incorrect.`
          this.showError = true
        } )
    }
  },
  mounted( ) {
    if ( this.$store.state.server ) {
      this.server = this.$store.state.server
      this.checkServer( )
    } else {
      this.server = `${window.location.origin}/api`
      this.checkServer( )
    }
    if ( this.$store.state.isAuth === true ) {
      this.$router.push( '/' )
      // this.errorMessage = 'You are already logged in!'
      // this.showError = true
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
