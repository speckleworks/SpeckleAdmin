<template>
  <div id="app">
    <md-button class="md-fab md-plain md-primary md-fab-bottom-left md-fixed" style='z-index: 10000' @click='showSidebar = !showSidebar' v-show='$store.state.isAuth'>
      <md-icon>{{showSidebar ? 'close' : 'menu'}}</md-icon>
    </md-button>
    <md-app md-waterfall>
      <md-app-drawer :md-active="showSidebar" class='md-primary xxx-md-elevation-10 nav-sidebar' style='' md-permanent="clipped" v-show='$store.state.isAuth && showSidebar'>
        <nav-drawer></nav-drawer>
      </md-app-drawer>
      <md-app-content>
        <keep-alive exclude='StreamDetailView'>
          <router-view></router-view>
        </keep-alive>
      </md-app-content>
    </md-app>
  </div>
</template>
<script>
import NavDrawer from './components/NavDrawer.vue'

export default {
  name: 'MainApp',
  components: {
    NavDrawer
  },
  data: _ => ( {
    showSidebar: true
  } ),
  created( ) {
    if ( this.$store.state.isAuth ) {
      this.$store.dispatch( 'getStreams', 'omit=objects,layers&isComputedResult=false&deleted=false&sort=-lastModified' )
      this.$store.dispatch( 'getProjects' )
    }
  }
}

</script>
<style lang='scss'>
$SpeckleBlue: #448aff;

.super-bg {
  background: #448aff;
  /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #448aff, #396afc);
  /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #448aff, #396afc);
  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */

}


#app {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.md-app {
  height: 100%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.btn-no-margin,
.no-margin {
  margin-left: 0 !important;
  margin-right: 0 !important;
}

.md-card.md-with-hover {
  cursor: default !important;
}

button {
  /*cursor: pointer !important;*/
}

.stream-chips:after {
  display: none !important;
}

.stream-chips:before {
  display: none !important;
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center !important;
}

.bg-ghost-white {
  background-color: ghostwhite;
}

.sticky-top {
  position: -webkit-sticky;
  /* Safari */
  position: sticky;
  top: 0;
  width: 100%;
  background-color: white;
  z-index: 100;
  margin-bottom: 30px;
}

</style>
