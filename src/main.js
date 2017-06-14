// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import App from './App'
// import Home from './components/Login'
import routes from '@/router/index'
Vue.use(VueRouter)

// const routes = [{
//   path: '/',
//   component: Home
// }]
const router = new VueRouter({
  routes
})
router.beforeEach((to, from, next) => {
  // 如果目标路径是登陆界面，删除登陆信息
  if (to.path === '/login') {
    sessionStorage.removeItem('user')
  }
  let userStr = sessionStorage.getItem('user')
  let user = null
  if (userStr !== 'undefined') {
    user = JSON.parse(userStr)
  }
  // 如果用户未登录并且目标路径不是登陆界面
  if (!user && to.path !== '/login') {
    next({ path: '/login' })
  } else {
    // 目标路径是登陆界面或者用户已登陆
    next()
  }
})
FastClick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
