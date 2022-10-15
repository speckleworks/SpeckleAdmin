<template>
  <v-app :dark='$store.state.dark'>
    <v-navigation-drawer fixed app clipped xxxclass='elevation-5' v-model='drawer'>
      <nav-drawer></nav-drawer>
    </v-navigation-drawer>
    <v-snackbar
      v-model="snackbar"
      top
      auto-height
      color="danger"
      :timeout="60*60*1000"
    >
    <div>
      <h2>Hello there! This frontend application for Speckle 1.0 will be retired by 15 November 2022.</h2>
      <p>You can continue using the free 1.0 server (hestia) by going to <a href="https://hestia.speckle.works">https://hestia.speckle.works</a>.</p>
      <p>Nevertheless, the Speckle team recommends you move to 2.0! For more info, contact us at hello [at] speckle [dot] systems.</p>
      <v-btn color="blue" style="width:70%; margin-left: 0px;" href="https://speckle.xyz">Go to Speckle 2.0</v-btn>
      <v-btn flat color="primary" @click="snackbar = false">Close</v-btn>
    </div>
      <!-- <v-btn
        color="primary"
        @click="snackbar = false"
      >
        Close
      </v-btn> -->
    </v-snackbar>


    <v-toolbar app clipped-left clipped-right>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title class='text-uppercase font-weight-light'>{{$route.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn flat fab small color='' @click.native='fullscreen'>
        <v-icon>{{isFullScreen ? "fullscreen_exit" :"fullscreen"}}</v-icon>
      </v-btn>
      <div v-if='$route.path.includes("view")' class='mt-1'>
        <v-btn fab small color='primary' @click.native='toggleControlsViewer'>
          <v-icon>{{$store.state.viewerControls ? "close" :"3d_rotation"}}</v-icon>
        </v-btn>
      </div>
    </v-toolbar>
    <v-content>
      <keep-alive exclude='StreamDetailView,SigninViewCallback,SigninView'>
        <router-view></router-view>
      </keep-alive>
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
    viewerControls: true,
    isFullScreen: false,
    snackbar: true
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
    },
    fullscreen( ) {
      if ( document.fullscreenElement ) {
        document.exitFullscreen()
        this.isFullScreen = false
        return
      }

      let element = document.documentElement
      this.isFullScreen = true
      if ( element.requestFullscreen ) {
        element.requestFullscreen( );
      } else if ( element.mozRequestFullScreen ) {
        element.mozRequestFullScreen( );
      } else if ( element.webkitRequestFullscreen ) {
        element.webkitRequestFullscreen( );
      } else if ( element.msRequestFullscreen ) {
        element.msRequestFullscreen( );
      }
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
    // let overlay = document.getElementsByClassName( "md-overlay" )[ 0 ]
    // if ( !overlay ) return
    // overlay.onclick = ( function ( ) {
    //   this.showSidebar = false
    // } ).bind( this )
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
