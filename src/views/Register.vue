<template>
  <md-content class='md-layout md-alignment-center-center md-primary' style="min-height: 100%">
    <form class="md-layout-item md-size-25" @submit.prevent='register'>
      <md-card class="md-elevation-3">
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Register</div>
            <div class="md-caption">at <strong><a :href='$store.state.server' target="_blank">{{$store.state.serverManifest.serverName}}</a></strong>. Do you want to <router-link to='/login'>login</router-link>?</div>
          </md-card-header-text>
        </md-card-header>
        <md-card-content>
          <md-field>
            <label>Email adress</label>
            <md-input v-model='email' name='email'></md-input>
          </md-field>
          <md-field>
            <label>Name</label>
            <md-input v-model='name' name='name'></md-input>
          </md-field>
          <md-field>
            <label>Surname</label>
            <md-input v-model='surname' name='surname'></md-input>
          </md-field>
          <md-field>
            <label>Company</label>
            <md-input v-model='company'></md-input>
          </md-field>
          <md-field>
            <label>Password</label>
            <md-input v-model='password' type="password" name='password' autocomplete="new-password"></md-input>
          </md-field>
        </md-card-content>
        <md-card-actions>
          <md-button type="submit" class="md-primary md-raised">Register</md-button>
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
  name: 'RegisterView',
  components: {
    SpeckleAlert
  },
  computed: {},
  data( ) {
    return {
      email: null,
      password: null,
      name: null,
      surname: null,
      company: null,
      errorMessage: null,
      showError: false
    }
  },
  methods: {
    register() {
      window.alert('todo')
    }
  },
  mounted( ) {
    if(this.$store.state.isAuth === true) {
      this.errorMessage = 'You are already authenticated!'
      this.showError = true
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
