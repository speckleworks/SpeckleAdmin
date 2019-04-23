<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs11 lg6>
        <form v-model='valid' @submit.prevent='register' v-if='$store.state.isAuth === false'>
          <v-card class="elevation-3">
            <v-toolbar class='title text-uppercase elevation-0'>
              <span>Register&nbsp;&nbsp;</span>
              <v-spacer></v-spacer>
              <span class='font-weight-light caption'>or <router-link to='/login'>login</router-link>?</span>
            </v-toolbar>
            <v-card-text>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-text-field prepend-inner-icon='developer_board' hint='The server url you want to connect to.' type="url" v-model='server' label='server api adress' name='server' @blur='checkServer'></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field :rules="emailRules" prepend-inner-icon='email' required type="email" v-model='email' label='your email' name='email'></v-text-field>
                </v-flex>
                <v-flex xs6>
                  <v-text-field :rules='nameRules' prepend-inner-icon='face' required type="" v-model='name' label='your name' name='name'></v-text-field>
                </v-flex>
                <v-flex xs6 pl-2>
                  <v-text-field :rules='surnameRules' required type="" v-model='surname' label='your surname' name='surname'></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field  prepend-inner-icon='business' required type="" v-model='company' label='your company' name='company'></v-text-field>
                </v-flex>
                <v-flex xs12>
                  <v-text-field :rules='passwordRules' prepend-inner-icon='lock' required v-model='password' type="password" label='your password' name='password'></v-text-field>
                </v-flex>
                <v-flex xs12>
                  Please be careful with what you do with your data.
                </v-flex>
              </v-layout>
            </v-card-text>
            <v-card-actions>
              <v-btn type="submit" class="md-primary md-raised">Register</v-btn>
            </v-card-actions>
            <v-alert v-model="showError" type="warning" dismissible>
              {{errorMessage}}
            </v-alert>
          </v-card>
        </form>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import Axios from 'axios'

export default {
  name: 'RegisterView',
  mixins: [ validationMixin ],
  components: {
    SpeckleAlert
  },
  computed: {},
  data( ) {
    return {
      valid: false,
      server: null,
      email: null,
      emailRules: [
        v => !!v || 'E-mail is required',
        v => /.+@.+/.test( v ) || 'E-mail must be valid'
      ],
      password: null,
      passwordRules: [
        v => !!v || 'Password is required',
        v => ( v && v.length >= 8 ) || 'Password must be at least 8 characters long'
      ],
      name: null,
      nameRules: [
        v => !!v || 'Name is required',
        v => ( v && v.length <= 12 ) || 'Name must be less than 12 characters'
      ],
      surname: null,
      surnameRules: [
        v => !!v || 'Surname (family name) is required',
        v => ( v && v.length <= 12 ) || 'Name must be less than 12 characters'
      ],
      company: null,
      errorMessage: null,
      showError: false,
      serverOk: false,
    }
  },
  methods: {
    register( ) {
      //window.alert( 'todo' )
      // TODO: validation...
      Axios.post( '/accounts/register', {
          email: this.email,
          name: this.name,
          surname: this.surname,
          company: this.company,
          password: this.password
        } )
        .then( res => {
          console.log( res )
          return this.$store.dispatch( 'login', { email: this.email, password: this.password } )
        } )
        .then( res => {
          console.log( 'Logged in.' )
          this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&deleted=false&sort=-lastModified' )
          this.$store.dispatch( 'getProjects' )
          this.$router.push( '/' )
        } )
        .catch( err => {
          this.errorMessage = `Failed to log in: ${err.response.data.message}`
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
    },
    getValidationClass( fieldName ) {
      if ( this.$v ) {
        const field = this.$v[ fieldName ]
        if ( field ) {
          return { 'md-invalid': field.$invalid && field.$dirty }
        }
      }
    },
    validateForm( ) {
      this.$v.$touch( )
      if ( !this.$v.$invalid )
        this.register( )
    }
  },
  mounted( ) {
    if ( this.$store.state.server ) {
      this.server = this.$store.state.server
      this.checkServer( )
    }
    if ( this.$store.state.isAuth === true ) {
      this.errorMessage = 'You are already authenticated!'
      this.showError = true
    }
  }
}
</script>
<style scoped lang='scss'>
</style>
