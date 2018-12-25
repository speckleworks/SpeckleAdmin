<template>
  <md-card class='md-layout md-layout-item md-size-100 md-alignment-top-center md-elevation-0' style='height:90vh' v-if='user'>
    <md-card-content class="md-layout-item md-size-55 md-large-size-65 md-medium-size-100">
      <div class="md-layout-item md-size-100 md-display-1">
        <br>
        Hello! Your name is <editable-span :text='user.name' hint='edit your name' @update='updateName'></editable-span>&nbsp<editable-span :text.sync='user.surname' hint='edit your surname' @update='updateSurname'></editable-span> and you work at <editable-span :text='user.company' hint='edit your company' @update='updateCompany'></editable-span>.<br>&nbsp
      </div>
      <div class="md-layout-item md-size-100">
        Your email address is {{user.email}}.<br>&nbsp
      </div>
      <md-button class='no-margin md-raised md-primary' @click.native='logout'>Logout</md-button>
      <p class='md-caption'>You have logged in {{user.logins.length}} times. <a @click='showToken = !showToken'>{{showToken ? "Hide" : "Show"}} your api token.</a></p>
      <div class='code md-caption' v-if='showToken'>{{user.apitoken}}</div>
      <br>
      <br>
    </md-card-content>
  </md-card>
</template>
<script>
export default {
  name: 'ProfileView',
  computed: {
    user( ) {
      return this.$store.state.user
    }
  },
  data( ) {
    return {
      showToken: false
    }
  },
  methods: {
    updateName( args ) {
      this.$store.dispatch( 'updateLoggedInUser', { _id: this.user._id, name: args.text } )
    },
    updateSurname( args ) {
      this.$store.dispatch( 'updateLoggedInUser', { _id: this.user._id, surname: args.text } )
    },
    updateCompany( args ) {
      this.$store.dispatch( 'updateLoggedInUser', { _id: this.user._id, company: args.text } )
    },
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
.code {
  position: relative;
  width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: all;
  font-family: monospace;
  background-color: ghostwhite;
}

</style>
