const Vue = require( 'vue' )
const Component = require( './AdminInterface.vue' )
module.exports = Component

Component.install = Vue => Vue.component( Component.name, Component )

// Install by default if using the script tag
if ( typeof window !== 'undefined' && window.Vue ) {
  window.Vue.use( Component )
}
