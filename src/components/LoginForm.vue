<template>
  <div>
    <div class="md-layout md-alignment-center-center">
      <div class="md-layout-item md-size-30 md-small-size-60 md-xsmall-size-100">
        <md-card class="md-elevation-10">
          <md-progress-bar md-mode="indeterminate" class="md-accent" v-if="sending"></md-progress-bar>
          <md-tabs md-dynamic-height class="md-primary">
            <md-tab md-label="Login">
              <form v-on:submit.prevent>
                <md-field :class="{ 'md-invalid' : errors.has('email') }">
                  <label>Email address</label>
                  <md-input v-model="email" data-vv-name="email" type="email" v-validate name="email" data-vv-rules="required|email" autocomplete="email"></md-input>
                  <span v-show="errors.has('email')" class="md-error">{{ errors.first('email') }}</span>
                </md-field>
                <md-field :class="{'md-invalid': errors.has('password')}">
                  <label>Password</label>
                  <md-input v-model="password" type="password" v-validate name="password" data-vv-rules="min:8|required" data-vv-name="password" autocomplete="password"></md-input>
                  <span v-show="errors.has('password')" class="md-error">{{ errors.first('password') }}</span>
                </md-field>
                <md-button type="submit" class="md-raised md-primary" @click='login'>Login</md-button>
              </form>
            </md-tab>
            <md-tab md-label="Register">
              <form>
                <md-field :class="{ 'md-invalid' : errors.has('email') }">
                  <label>Email address</label>
                  <md-input v-model="email" data-vv-name="email" type="email" v-validate name="email" data-vv-rules="required|email" autocomplete="email"></md-input>
                  <span v-show="errors.has('password')" class="md-error">{{ errors.first('email') }}</span>
                </md-field>
                <md-field :class="{ 'md-invalid' : errors.has('name') }">
                  <label>Name</label>
                  <md-input v-model="name" data-vv-name="name" type="name" v-validate name="name" data-vv-rules="required|min:3" autocomplete="name"></md-input>
                  <span v-show="errors.has('name')" class="md-error">{{errors.first('name')}}</span>
                </md-field>
                <md-field>
                  <label>Surname</label>
                  <md-input v-model="surname" autocomplete="surname"></md-input>
                </md-field>
                <md-field>
                  <label>Company/Department</label>
                  <md-input v-model="company"></md-input>
                </md-field>
                <md-field :class="{ 'md-invalid' : errors.has('password') }">
                  <label>Password</label>
                  <md-input v-model="password" type="password"></md-input>
                  <span v-show="errors.has('password')" class="md-error">{{ errors.first('password') }}</span>
                </md-field>
                <md-button class="md-raised md-primary" @click='register' :disabled='sending'>
                  register
                </md-button>
              </form>
            </md-tab>
          </md-tabs>
        </md-card>
        <md-snackbar md-position="center" :md-duration="Infinity" :md-active="error!=null" md-persistent>
          <span>{{error}}</span>
          <md-button class="md-accent" @click="error = null">Dismiss</md-button>
        </md-snackbar>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data( ) {
    return {
      sending: false,
      error: null,
      password: null,
      email: null,
      name: null,
      surname: null,
      company: null
    }
  },
  methods: {
    register( ) {
      this.$validator.validateAll( ).then( result => {
        if ( !result ) return
        this.sending = true
        // return
        this.$store.dispatch( 'register', { email: this.email, password: this.password, name: this.name, surname: this.surname, company: this.company } )
          .then( res => {
            this.sending = false
            this.$emit( 'succes', true )
          } )
          .catch( err => {
            this.sending = false
            this.password = null
            this.email = null
            this.name = null
            this.surname = null
            this.company = null
            this.error = err
          } )
      } )
    },
    login( ) {
      this.$validator.validateAll( ).then( result => {
        console.log( this.errors.items )
        // this sux
        if ( !result && this.errors.items[ 0 ].field != "name" ) return
        this.sending = true
        this.$store.dispatch( 'login', { password: this.password, email: this.email } )
          .then( res => {
            this.sending = false
            this.$emit( 'succes', true )
          } )
          .catch( err => {
            this.sending = false
            this.password = null
            this.error = err
          } )
      } )
    }
  }
}

</script>
<style lang="scss" scoped>
.md-layout {
  height: 90vh;
}

</style>
