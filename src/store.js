import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    server: null,
    serverManifest: {
      serverName: null,
      api: null,
      version: null
    },
    token: null,
    user: {},
    isAuth: false,
    streams: [],
    projects: [],
    comments: []
  },
  mutations: {

  },
  actions: {

  }
})
