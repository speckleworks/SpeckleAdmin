import Vue from 'vue'
import Router from 'vue-router'
import Store from './store'

Vue.use( Router )

let myRouter = new Router( {
  linkExactActiveClass: 'is-active',
  routes: [ {
      path: '/',
      name: 'dashboard',
      component: ( ) => import( './views/Dashboard.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/login/:redirectTo?',
      name: 'login',
      component: ( ) => import( './views/Login.vue' )
    },
    {
      path: '/register',
      name: 'register',
      component: ( ) => import( './views/Register.vue' ),
    },
    {
      path: '/streams',
      name: 'streams',
      component: ( ) => import( './views/Streams.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/streams/:streamId',
      name: 'singlestream',
      component: ( ) => import( './views/StreamDetail.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/projects',
      name: 'projects',
      component: ( ) => import( './views/Projects.vue' ),
      meta: { requiresAuth: true },
    }, {
      path: '/projects/:projectId',
      name: 'singleproject',
      component: ( ) => import( './views/ProjectDetail.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ( ) => import( './views/Profile.vue' ),
      meta: { requiresAuth: true },
    }
  ]
} )

myRouter.beforeEach( ( to, from, next ) => {
  if ( to.meta.requiresAuth ) {
    if ( to.meta.requiresAuth === true && Store.state.isAuth === false )
      return next( { path: '/login' + ( to !== null ? "/" + window.btoa( to.path ) : "" ) } )
  }
  next( )
} )

export default myRouter
