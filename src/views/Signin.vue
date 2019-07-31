<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs11 md6 lg6>
        <form @submit.prevent='login' v-if='$store.state.isAuth === false'>
          <v-card class="elevation-3">
            <v-toolbar dense class='title small text-uppercase elevation-0'>
              <v-icon small>lock</v-icon>&nbsp;<span class='font-weight-light'>Sign In</span>
            </v-toolbar>
            <v-card-text>
              <v-text-field xxx-prepend-inner-icon='developer_board' hint='server url' type="url" v-model='server' name='server' label='server url' placeholder='https://speckle.yourdomain.com'></v-text-field>
              <v-btn type="submit" block color='primary' class="md-primary md-raised">
                <v-icon>arrow_right_alt</v-icon>
              </v-btn>
            </v-card-text>
            <v-card-text>
              Previously used accounts:
              <!-- {{localStorage}} -->
            </v-card-text>
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
      this.showError = false
      let url = null
      try {
        url = new URL( this.server )
        let originUrl = new URL( window.location.href )

        window.open( `${url.origin}/signin?redirectUrl=${ window.encodeURIComponent( location.origin +'/#/signin/callback') }`, 'login screen', 'height=700,width=800' )
      } catch(err) {
        this.errorMessage = err.message
        this.showError = true
      }
      // window.location.href =

    },
    checkServer( ) {

    }
  },
  mounted( ) {
    // TODO: chekc local storage for any previously used servers
    if ( this.$store.state.isAuth === true ) {
      this.$router.push( '/' )
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
