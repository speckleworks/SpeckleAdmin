<template>
  <div class="page-container">
    <md-app md-waterfall-xxx md-mode="fixed">
      <md-app-drawer :md-active.sync="showProfile">
        <profile></profile>
      </md-app-drawer>
      <md-app-toolbar class="md-primary md-dense" style='z-index: 10' v-if='$store.state.auth'>
        <div class="md-toolbar-row">
          <div class="md-toolbar-section-start">
            <md-button class='md-dense md-icon-button' @click='showProfile=true'>
              <md-icon>account_circle</md-icon>
            </md-button>
            <p>Hello {{$store.state.user.name}}!</p>
            <!-- <md-button v-for='route in routes' :key='route.name' :class="{'md-dense':true, 'md-raised': false}" @click='changeView( route )'>{{route.name}}</md-button>
             -->
            <!-- <md-button v-for='route in routes' :key='route.name' :class="{'md-dense':true, 'md-raised': route.selected}" @click='changeView( route )'>{{route.name}}</md-button> -->
          </div>
          <div class="md-toolbar-section-end">
              <a href="https://speckle.works">
              <img src='https://speckle.works/img/logos/logo-xs.png' width="17"/>
              <md-tooltip md-direction="left">Speckle.Works!</md-tooltip>
              </a>
          </div>
        </div>
      </md-app-toolbar>
      <md-app-content>
        <transition name='fade'>
          <login-form v-if='!auth'></login-form>
          <component v-else :is='currentView'></component>
        </transition>
      </md-app-content>
    </md-app>
  </div>
</template>
<script>
import Axios from 'axios'

import LoginForm from './components/LoginForm.vue'
import StreamsView from './components/StreamsView.vue'
import Profile from './components/Profile.vue'

export default {
  name: 'app',
  components: {
    LoginForm,
    StreamsView,
    Profile
  },
  watch: {
    auth( newValue ) {
      if ( !newValue ) this.showProfile = false
    }
  },
  computed: {
    auth( ) {
      return this.$store.state.auth
    }
  },
  data( ) {
    return {
      routes: [ {
        name: "your streams",
        component: "streams-view",
        selected: true
      } ],
      currentView: 'streams-view',
      catFact: null,
      showCatFact: false,
      showProfile: false
    }
  },
  methods: {
    changeView( route ) {
      console.log( route )
      this.routes.forEach( myRoute => {
        if ( route.name == myRoute.name ) {
          myRoute.selected = true
          this.currentView = myRoute.component
        } else {
          myRoute.selected = false
        }
      } )
    },
    getCatFact( ) {
      this.catFact = this.$store.state.facts[ Math.floor( Math.random( ) * this.$store.state.facts.length ) ].fact;
    }
  },
  mounted( ) {
    this.getCatFact( )
  }
}

</script>
<style lang="scss">
.md-app {
  height: 100vh;
  border: 1px solid rgba(#000, .12);
}

.md-content {
  padding: 0;
}

.md-text-right {
  text-align: right;
}

.md-text-center {
  text-align: center;
}

.md-text-left {
  text-align: left;
}

.md-underline-button {
  border-radius: 0;
  border-bottom: 2px solid white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity .3s;
}

.fade-enter,
.fade-leave-to
/* .fade-leave-active below version 2.1.8 */

{
  opacity: 0;
}

@import "~vue-material/dist/theme/engine"; // Import the theme engine
@include md-register-theme("default", ( primary: md-get-palette-color(blue, A400), // The primary color of your application
// accent: md-get-palette-color(red, A400), // The accent or secondary color
// theme: dark
));
@import "~vue-material/dist/theme/all"; // Apply the theme

</style>
