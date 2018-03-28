import Vue from 'vue'
import Axios from 'axios'
import VueMaterial from 'vue-material'
import VeeValidate from 'vee-validate'
import moment from 'moment'
import VueTimeago from 'vue-timeago'

import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

import App from './App.vue'

Vue.use( VueMaterial )
Vue.use( VeeValidate )

Vue.prototype.$http = Axios
window._adminBus = new Vue( )

Vue.use( VueTimeago, {
  name: 'timeago', // component name, `timeago` by default
  locale: 'en-US',
  locales: {
    'en-US': require( 'vue-timeago/locales/en-US.json' )
  }
} )

Vue.filter( 'formatDate', function( value ) {
  if ( value ) {
    return moment( String( value ) ).format( 'DD/MM/YYYY' )
  }
} )

new Vue( {
  el: '#app',
  render: h => h( App )
} )
