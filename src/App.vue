<template>
  <v-app :dark='dark'>
    <v-navigation-drawer floating app class='elevation-5' v-model='drawer'>
      <v-toolbar flat prominent class='super-bg' dark>
        <div class='text-uppercase caption ml-0'>
          <a href='https://speckle.works' target="_blank" style="color:white; text-decoration: none">Speckle,
            <span class='font-weight-light caption'>the data platform for AEC.</span></a>
        </div>
      </v-toolbar>
      <nav-drawer></nav-drawer>
    </v-navigation-drawer>
    <v-toolbar app flat class=''>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class='text-uppercase font-weight-light'>{{$route.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat icon @click.native='toggleDark()'>
        <v-icon>{{dark ? "wb_sunny" : "brightness_4"}}</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <!-- <v-container fluid> -->
      <keep-alive exclude='StreamDetailView'>
        <router-view></router-view>
      </keep-alive>
      <!-- </v-container> -->
    </v-content>
  </v-app>
</template>
<script>
import NavDrawer from './components/NavDrawer.vue'

export default {
  name: 'MainApp',
  components: {
    NavDrawer
  },
  data: _ => ( {
    drawer: true,
    dark: false
  } ),
  methods: {
    toggleDark( ) {
      this.dark = !this.dark
      localStorage.setItem( 'dark', this.dark )
      // TODO: persist to local storage
    }
  },
  created( ) {
    if ( this.$store.state.isAuth ) {
      this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&sort=updatedAt' )
      this.$store.dispatch( 'getProjects' )
    }
    if ( localStorage.getItem( 'dark' ) === 'true' ) this.dark = true

  },
  updated( ) {
    let overlay = document.getElementsByClassName( "md-overlay" )[ 0 ]
    if ( !overlay ) return
    overlay.onclick = ( function( ) {
      this.showSidebar = false
    } ).bind( this )
  }

}

</script>
<style lang='scss'>
.super-bg {
  background: #448aff;
  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #448aff, #396afc);
  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #448aff, #396afc);
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.other-bg {
  background: #0052D4;
  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #6FB1FC, #4364F7, #0052D4);
  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #6FB1FC, #4364F7, #0052D4);
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

</style>
