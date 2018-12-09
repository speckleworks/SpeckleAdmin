<template>
  <div id="app">
    <md-button class="md-fab md-plain md-fab-bottom-left md-fixed" style='z-index: 10000' @click='showSidebar = !showSidebar' v-show='$store.state.isAuth'>
      <md-icon>{{showSidebar ? 'close' : 'menu'}}</md-icon>
    </md-button>
    <md-app md-waterfall>
      <md-app-drawer :md-active="showSidebar" class='md-primary md-elevation-10 md-primary nav-sidebar' style='' md-permanent="clipped" v-show='$store.state.isAuth && showSidebar'>
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
  } )
}

</script>
<style>
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

.btn-no-margin, .no-margin {
  margin-left: 0 !important;
  margin-right: 0 !important;
}


.md-card.md-with-hover {
  cursor: default !important;
}

.stream-chips:after {
  display: none !important;
}

.stream-chips:before {
  display: none !important;
}

.text-right{
  text-align: right;
}

</style>
