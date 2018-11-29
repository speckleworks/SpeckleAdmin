import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from './views/Dashboard.vue'

Vue.use( Router )

export default new Router( {
  linkExactActiveClass: 'is-active',
  routes: [ {
      path: '/',
      name: 'Dashboard',
      component: Dashboard
    },
    {
      path: '/about',
      name: 'about',
      component: ( ) => import( './views/About.vue' )
    },
    {
      path: '/streams',
      name: 'streams',
      component: ( ) => import( './views/Streams.vue' )
    },
    {
      path: '/projects',
      name: 'projects',
      component: ( ) => import( './views/Projects.vue' )
    },
    {
      path: '/profile',
      name: 'profile',
      component: ( ) => import( './views/Profile.vue' )
    }
  ]
} )
