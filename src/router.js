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
      path: '/signin',
      name: 'signin',
      component: ( ) => import( './views/Signin.vue' ),
      beforeEnter( to, from, next ) {
        console.log( 'beforeEnter -> singin route' )
        next( )
      }
    },
    {
      path: '/signin/callback',
      name: '',
      component: ( ) => import( './views/SigninCallback.vue' ),
      // beforeEnter( to, from, next ) {
      //   // console.log( to.query.token )
      //   let conn = to.query.token.split(':::')
      //   console.log( conn )
      //   let jwt = window.atob(conn[0])
      //   let server = window.atob(conn[1])
      //   console.log(server)
      //   console.log(jwt)
      //   next( { name: 'feedback' } )
      // },
      // redirect: '/'
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
      component: ( ) => import( './views/Stream.vue' ),
      meta: { requiresAuth: true },
      children: [ {
        name: 'stream overview',
        path: '',
        component: ( ) => import( './views/StreamOverview.vue' )
      }, {
        name: 'stream data',
        path: 'data',
        component: ( ) => import( './views/StreamData.vue' )
      }, {
        name: 'stream sharing',
        path: 'sharing',
        component: ( ) => import( './views/StreamSharing.vue' )
      }, {
        name: 'stream history',
        path: 'history',
        component: ( ) => import( './views/StreamHistory.vue' )
      } ]
    },
    {
      path: '/projects',
      name: 'projects',
      component: ( ) => import( './views/Projects.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/projects/:projectId',
      name: 'project overview',
      component: ( ) => import( './views/Project.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/view/:streamIds*',
      name: 'viewer',
      component: ( ) => import( './views/Viewer.vue' ),
      meta: { requiresAuth: false },
    },
    {
      path: '/trash',
      name: 'trash',
      component: ( ) => import( './views/Trash.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ( ) => import( './views/Profile.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/plugins',
      name: 'plugins',
      component: ( ) => import( './views/Plugins.vue' ),
      meta: { requiresAuth: false },
    },
    {
      path: '/feedback',
      name: 'feedback',
      component: ( ) => import( './views/Feedback.vue' ),
      meta: { requiresAuth: false },
    },
    {
      path: '/admin',
      name: '',
      component: ( ) => import( './views/Admin.vue' ),
      meta: { requiresAuth: true },
      children: [ {
        name: 'admin users',
        path: '',
        component: ( ) => import( './views/AdminUsers.vue' )
      }, {
        name: 'admin streams',
        path: 'streams',
        component: ( ) => import( './views/AdminStreams.vue' )
      }, {
        name: 'admin projects',
        path: 'projects',
        component: ( ) => import( './views/AdminProjects.vue' )
      } ]
    },
    {
      path: '/processors',
      name: 'processors',
      component: ( ) => import( './views/Processors.vue' ),
      meta: { requiresAuth: true },
    },
    {
      path: '/processors/:processorId',
      name: 'processor overview',
      component: ( ) => import( './views/Processor.vue' ),
      meta: { requiresAuth: true },
    }
  ],
  // scrollBehavior( to, from, savedPosition ) {
  //   console.log( 'scrollBehavior' )
  //   return { x: 0, y: 0 }
  // }
} )

// myRouter.afterEach( ( to, from ) => {
//   document.getElementById( 'app' ).scrollIntoView( )
// } )

myRouter.beforeEach( ( to, from, next ) => {

  if ( to.meta.requiresAuth ) {
    if ( to.meta.requiresAuth === true && Store.state.isAuth === false )
      return next( { path: '/signin' })
  }

  next( )
} )

export default myRouter
