<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs11 md6 lg6>
        <form @submit.prevent='login' v-if='$store.state.isAuth === false'>
          <v-card class="elevation-3">
            <v-toolbar dense class='title small text-uppercase elevation-0'>
              <v-icon small>lock_open</v-icon>&nbsp;<span class='font-weight-light'>Finishing up...</span>
            </v-toolbar>
            <v-card-text>
              This shouldn't take long.
            </v-card-text>
            <!-- <v-card-text>
            </v-card-text> -->
            <v-card-actions>
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
  name: 'SigninView',
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
  methods: {
    login( ) {

    },
    checkServer( ) {

    }
  },
  mounted( ) {
    // TODO: chekc local storage for any previously used servers
    if ( this.$store.state.isAuth === true ) {
      this.$router.push( '/' )
    }

    let conn = this.$route.query.token.split( ':::' )
    console.log( conn )
    let jwt = window.atob( conn[ 0 ] )
    let server = window.atob( conn[ 1 ] )
    console.log( server )
    console.log( jwt )

  }
}

</script>
<style scoped lang='scss'>
</style>
