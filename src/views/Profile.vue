<template>
  <v-container grid-list-xl>
    <v-layout row wrap>
      <v-flex xs12 pt-5 pb-0 class='headline font-weight-light'>
        Hello 👋 <br>Your name is <editable-span :text='user.name' hint='edit your name' @update='updateName'></editable-span>&nbsp;<editable-span :text.sync='user.surname' hint='edit your surname' @update='updateSurname'></editable-span> and you work at <editable-span :text='user.company' hint='edit your company' @update='updateCompany'></editable-span>. <v-btn @click.native='logout'>Logout</v-btn depressed>
      </v-flex>
      <v-flex xs12 my-5>
      <!-- <v-divider></v-divider> -->
        <v-btn class='ma-0' @click.native='showToken = !showToken'>{{showToken ? "Hide" : "Show"}} Token</v-btn depressed><br>&nbsp;<br>
        <code v-if='showToken' class='caption' style="user-select:all">{{user.apitoken}}</code>
      </v-flex>
    </v-layout>
  </v-container>
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
