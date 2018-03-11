import Vue from 'vue'
import App from './App.vue'
import Axios from 'axios'
import VueMaterial from 'vue-material'
import VeeValidate from 'vee-validate'
import moment from 'moment'


import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'


import Store from './store/index'

Vue.use( VueMaterial )
Vue.use( VeeValidate )

Vue.prototype.$http = Axios
window.bus = new Vue( )

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
      window.localStorage.clear()
    } )
}

new Vue( {
  el: '#app',
  store: Store,
  render: h => h( App )
} )

function debounce( func, wait, immediate ) {
  var timeout;
  return function( ) {
    var context = this,
      args = arguments;
    var later = function( ) {
      timeout = null;
      if ( !immediate ) func.apply( context, args );
    };
    var callNow = immediate && !timeout;
    clearTimeout( timeout );
    timeout = setTimeout( later, wait );
    if ( callNow ) func.apply( context, args );
  };
};
