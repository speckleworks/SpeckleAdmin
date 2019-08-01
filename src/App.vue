<template>
  <v-app :dark='dark'>
    <v-navigation-drawer floating app class='elevation-5' v-model='drawer'>
      <v-hover>
        <v-toolbar slot-scope="{ hover }" flat prominent :class='`elevation-${hover ? 20 : 0} ${dark ? "royal-bg" : "light-bg" }`' dark xxxstyle='position: absolute; bottom:0'>
          <div class='text-uppercase caption ml-0'>
            <a href='https://speckle.works' target="_blank" style="color:white; text-decoration: none;"><b>Speckle</b>,
              <span class='font-weight-light caption'>the open source data platform for AEC.</span></a>
          </div>
        </v-toolbar>
      </v-hover>
      <nav-drawer></nav-drawer>
    </v-navigation-drawer>
    <v-toolbar app flat class=''>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class='text-uppercase font-weight-light'>{{$route.name}}</v-toolbar-title>
      <div v-if='$route.path.includes("view")' class='mt-1'>
        <v-btn small round flat @click.native='toggleControlsViewer'>{{$store.state.viewerControls ? "close" :"show"}} controls</v-btn>
      </div>
      <v-spacer></v-spacer>
      <v-btn v-if='$store.state.isAuth' small flat @click.native='logout()'>
        Logout
      </v-btn>
      <v-btn flat small icon @click.native='toggleDark()'>
        <v-icon small>wb_sunny</v-icon>
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
    dark: false,
    viewerControls: true
  } ),
  methods: {
    toggleDark( ) {
      this.dark = !this.dark
      localStorage.setItem( 'dark', this.dark )
    },
    logout( ) {
      this.$store.dispatch( 'logout' )
      this.$router.push( '/signin' )
    },
    toggleControlsViewer( ) {
      this.$store.commit( 'TOGGLE_VIEWER_CONTROLS' )
    }
  },
  created( ) {
    if ( this.$store.state.isAuth ) {
      this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&sort=updatedAt' )
      this.$store.dispatch( 'getProjects' )
      this.$store.dispatch( 'getProcessors' )
      this.$store.dispatch( 'createClient' )
    }
    if ( localStorage.getItem( 'dark' ) === 'true' ) {
      this.dark = true
      this.$store.commit( 'SET_DARK', true )
    }

    this.$store.dispatch( 'loadLambdas' )
  },
  updated( ) {
    let overlay = document.getElementsByClassName( "md-overlay" )[ 0 ]
    if ( !overlay ) return
    overlay.onclick = ( function ( ) {
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

.royal-bg {
  background: #536976;
  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #292E49, #536976);
  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #292E49, #536976);
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.light-bg {
  background: #56CCF2;
  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #2F80ED, #56CCF2);
  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #2F80ED, #56CCF2);
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

.no-scroll {
  overflow: hidden !important;
}

</style>
