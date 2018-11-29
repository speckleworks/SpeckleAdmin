<template>
  <div id="app">
    <md-app md-waterfall>
      <md-app-drawer :md-active.sync="showSidebar" class='md-elevation-10 md-primary nav-sidebar' style='' md-persistent="full">
        <nav-drawer></nav-drawer>
      </md-app-drawer>
      <md-app-content>
        <keep-alive>
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
<style lang='scss'>
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

</style>
