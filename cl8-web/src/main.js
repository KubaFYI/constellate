// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
/* eslint-disable */
import Vue from 'vue'
import App from './App'
import router from './routes'
import store from './store'
import VeeValidate from 'vee-validate'
import VueFire from 'vuefire'
import VueFuse from 'vue-fuse'
import fbase from './fbase'
import VueAnalytics from 'vue-analytics'

import debugLib from 'debug'
const debug = debugLib('cl8.main.js')

Vue.config.productionTip = false
Vue.config.devtools = true

const vvConfig = {
  events: 'blur',
  class: true
}
Vue.use(VeeValidate, vvConfig)
Vue.use(VueFuse)
Vue.use(VueFire)

Vue.use(VueAnalytics, {
  id: process.env.GOOGLE_ANALYTICS_UA,
  router
})

let app

router.beforeEach((to, from, next) => {
  debug(to.name, to.from)
  let requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  let currentUser = fbase.auth().currentUser
  debug('currentUser:', currentUser)

  if (currentUser && to.name === 'signin') {
    next('home')
  }

  if (currentUser) {
    debug(`store.commit('setFBUser', ${currentUser})`)
    store.commit('setFBUser', currentUser)
  }
  if (requiresAuth && !currentUser) {
    // you need to be logged in, so log the user in
    debug(`signing in, as we have no fbase user`)
    next('signin')
  } else {
    next()
  }
})

// wrapping the vue app here forces us to wait til we have the firebase object loaded
// before we load Vue object
fbase.auth().onAuthStateChanged(firebaseUser => {
  /* eslint-disable no-new */
  if (firebaseUser) {
    debug('user:', firebaseUser.displayName)
  }
  if (!app) {
    store.commit('stopLoading')
    app = new Vue({
      el: '#app',
      router,
      store,
      template: '<App/>',
      components: { App }
    })
  }
})
