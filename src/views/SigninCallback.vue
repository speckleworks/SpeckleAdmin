<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs11 md6 lg6>
        <v-card class="elevation-3" v-if='!$store.state.isAuth'>
          <v-toolbar dense class='title small text-uppercase elevation-0'>
            <v-icon small>lock_open</v-icon>&nbsp;<span class='font-weight-light'>Finishing up...</span>
          </v-toolbar>
          <v-card-text>
            This shouldn't take long.
          </v-card-text>
          <v-card-actions>
          </v-card-actions>
          <v-alert v-model="showError" type="warning" dismissible>
            {{errorMessage}}
          </v-alert>
        </v-card>
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
  name: 'SigninViewCallback',
  components: {},
  computed: {},
  watch: {},
  data( ) {
    return {
      server: null,
      errorMessage: null,
      showError: false
    }
  },
  methods: {},
  mounted( ) {
    // TODO: chekc local storage for any previously used servers
    if ( this.$store.state.isAuth === true ) {
      return this.$router.push( '/' )
    }

    let conn = window.decodeURIComponent( this.$route.query.token )
    console.log( conn.split( ':::' ) )

    let jwt = conn.split( ':::' )[ 0 ]
    let server = conn.split( ':::' )[ 1 ]

    this.$store.dispatch( 'authenticate', { server: server, token: jwt } )
      .then( ( ) => {

        this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&sort=updatedAt' )
        this.$store.dispatch( 'getProjects' )
        this.$store.dispatch( 'getProcessors' )
        this.$store.dispatch( 'createClient' )

        this.$router.push( '/' )
      } )
      .catch( err => {
        this.errorMessage = err.message
        this.showError = true
      } )
  }
}

</script>
<style scoped lang='scss'>
</style>
