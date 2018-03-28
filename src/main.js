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
    return moment( String( value ) ).format( 'DD/MM/YYYY' )
  }
} )


// Url checking
let locationParams = window.location.href.split( '?' )

// If there is something after the ? and we're not doing dev
if ( locationParams.length >= 2 && window.location.href.indexOf( 'dev' ) === -1 ) {
  let myParams = JSON.parse( window.atob( locationParams[ 1 ] ) )
  console.log( myParams )
  if ( myParams.hasOwnProperty( 'serverUrl' ) )
    Store.state.server = myParams[ 'serverUrl' ]
  if ( myParams.hasOwnProperty( 'token' ) )
    tryTokenLogin( myParams[ 'serverUrl' ], myParams[ 'token' ] )
    .then( res => {
      Store.state.auth = true
      Store.state.token = myParams[ 'token' ]
      Store.state.user = res.data.user
    } )
    .catch( err => {
      window.alert( 'invalid parameters!' )
    } )
} else {
  if ( window.location.href.indexOf( 'dev' ) !== -1 ) // we're developing, so default to a default server
    Store.state.server = 'http://localhost:3000/api/v1'
  else // assume we're running online
    Store.state.server = window.location.origin + '/api/v1'

  let token = window.localStorage.getItem( 'token' )
  tryTokenLogin( Store.state.server, token )
    .then( res => {
      Store.state.auth = true
      Store.state.token = token
      Store.state.user = res.data.resource
    } )
    .catch( res => {
      window.localStorage.clear( )
    } )
}

function tryTokenLogin( server, myToken ) {
  return Axios.get( server + '/accounts', { headers: { Authorization: myToken } } )
}

new Vue( {
  el: '#app',
  store: Store,
  render: h => h( App )
} )
