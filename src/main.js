// // Url checking
// let locationParams = window.location.href.split( '?' )

// // If there is something after the ? and we're not doing dev
// if ( locationParams.length >= 2 && window.location.href.indexOf( 'dev' ) === -1 ) {
//   let myParams = JSON.parse( window.atob( locationParams[ 1 ] ) )
//   console.log( myParams )
//   if ( myParams.hasOwnProperty( 'serverUrl' ) )
//     Store.state.server = myParams[ 'serverUrl' ]
//   if ( myParams.hasOwnProperty( 'token' ) )
//     tryTokenLogin( myParams[ 'serverUrl' ], myParams[ 'token' ] )
//     .then( res => {
//       Store.state.auth = true
//       Store.state.token = myParams[ 'token' ]
//       Store.state.user = res.data.user
//     } )
//     .catch( err => {
//       window.alert( 'invalid parameters!' )
//     } )
// } else {
//   if ( window.location.href.indexOf( 'dev' ) !== -1 ) // we're developing, so default to a default server
//     Store.state.server = 'http://localhost:3000/api/v1'
//   else // assume we're running online
//     Store.state.server = window.location.origin + '/api/v1'

//   let token = window.localStorage.getItem( 'token' )
//   tryTokenLogin( Store.state.server, token )
//     .then( res => {
//       Store.state.auth = true
//       Store.state.token = token
//       Store.state.user = res.data.resource
//     } )
//     .catch( res => {
//       window.localStorage.clear( )
//     } )
// }

// function tryTokenLogin( server, myToken ) {
//   return Axios.get( server + '/accounts', { headers: { Authorization: myToken } } )
// }

import Vue from 'vue'
import App from './App.vue'
// window.Vue = Vue
new Vue( {
  el: '#app',
  render: h => h( App )
} )
