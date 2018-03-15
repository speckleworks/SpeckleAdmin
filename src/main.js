import Vue from 'vue'
import App from './App.vue'
import Axios from 'axios'
import VueMaterial from 'vue-material'
import VeeValidate from 'vee-validate'
import moment from 'moment'
import VueTimeago from 'vue-timeago'

import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'


import Store from './store/index'

Vue.use( VueMaterial )
Vue.use( VeeValidate )

Vue.prototype.$http = Axios
window.bus = new Vue( )

Vue.use( VueTimeago, {
  name: 'timeago', // component name, `timeago` by default
  locale: 'en-US',
  locales: {
    // you will need json-loader in webpack 1
    'en-US': require( 'vue-timeago/locales/en-US.json' )
  }
} )

Vue.filter( 'formatDate', function( value ) {
  if ( value ) {
    return moment( String( value ) ).format( 'DD/MM/YYYY hh:mm' )
  }
} )

// this is wrong, but it works
if ( !window.location.href.includes( 'dev' ) )
  Store.state.server = 'https://s003.speckle.works/api'
else
  Store.state.server = 'http://localhost:3000/api'

let token = window.localStorage.getItem( "token" )
let email = window.localStorage.getItem( "email" )

if ( token ) {
  Axios.get( Store.state.server + '/accounts/profile', { headers: { Authorization: token } } )
    .then( res => {
      Store.state.auth = true
      Store.state.token = token
      Store.state.user = res.data.user
    } )
    .catch( err => {
      window.localStorage.clear( )
    } )
}

new Vue( {
  el: '#app',
  store: Store,
  render: h => h( App )
} )
