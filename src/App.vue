<template>
  <div class="page-container">
    <md-app md-waterfall-xxx md-mode="fixed">
      <md-app-toolbar class="md-primary md-dense" style='z-index: 10' v-if='$store.state.auth'>
        <div class="md-toolbar-row">
          <div class="md-toolbar-section-start">
            <!-- <h3 class="md-subheading">Speckle Admin</h3> -->
            
            <md-button v-for='route in routes' :key='route.name' :class="{'md-dense':true, 'md-raised': route.selected}" @click='changeView( route )'>{{route.name}}</md-button>
          </div>
          <div class="md-toolbar-section-end">
            Hello {{$store.state.user.name}}!
            <md-button :md-ripple="false" class='md-dense md-accent' @click='logout'>Logout</md-button>
          </div>
        </div>
      </md-app-toolbar>
      <md-app-content>
        <login-form v-if='!auth'></login-form>
        <component v-else :is='currentView'></component>
      </md-app-content>
    </md-app>
  </div>
</template>
<script>
import LoginForm from './components/LoginForm.vue'
import StreamsView from './components/StreamsView.vue'
import ProfileView from './components/ProfileView.vue'

export default {
  name: 'app',
  components: {
    LoginForm,
    StreamsView,
    ProfileView
  },
  computed: {
    auth( ) {
      return this.$store.state.auth
    }
  },
  data( ) {
    return {
      routes: [ {
          name: "streams",
          component: "streams-view",
          selected: true
        },
        {
          name: "profile",
          component: "profile-view",
          selected: false
        }
      ],
      currentView: 'streams-view'
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
    logout( ) {
      this.$store.commit( 'setCredentials', { auth: false, token: null } )
      window.localStorage.clear( )
    }
  },
  mounted( ) {

  }
}

</script>
<style lang="scss">
.md-app {
  height: 100vh;
  border: 1px solid rgba(#000, .12);
}

.md-content{
  padding: 0;
}
.md-text-right {
  text-align: right;
}

.md-text-center{
  text-align: center;
}

.md-text-left {
  text-align: left;
}

.md-underline-button {
  border-radius: 0;
  border-bottom: 2px solid white;
}

@import "~vue-material/dist/theme/engine"; // Import the theme engine
@include md-register-theme("default", ( primary: md-get-palette-color(blue, A400), // The primary color of your application
accent: md-get-palette-color(cyan, A200), // The accent or secondary color
// theme: dark
));

@import "~vue-material/dist/theme/all"; // Apply the theme

</style>
