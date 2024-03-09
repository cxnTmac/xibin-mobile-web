// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import App from './App'
// import Home from './components/Login'
import routes from '@/router/index'
import store from '@/vuex/store'
import util from '../common/js/util'
import VueClipboard from 'vue-clipboard2'
Vue.use(VueClipboard)
Vue.use(VueRouter)
Vue.use(Vuex)
// const routes = [{
//   path: '/',
//   component: Home
// }]
const router = new VueRouter({
  routes: routes,
  base: '/xibin-mobile/'
})
router.beforeEach((to, from, next) => {
  // 如果目标路径是登陆界面，删除登陆信息
  if (to.path === '/login') {
    localStorage.removeItem('user')
    localStorage.removeItem('overTime')
  }
  // let userStr = util.getCookie('user')
  let userStr = localStorage.getItem('user')
  let overTime = localStorage.getItem('overTime')
  let user = null
  if (userStr !== 'undefined' && userStr !== '' && userStr !== null) {
    user = JSON.parse(userStr)
  }
  // 过期标识,默认是过期
  let overTimeFlag = true
  // 判断是否过期
  if (user) {
    if (overTime >= new Date().getTime()) {
      // 表示未过期
      overTimeFlag = false
    }
  }
  // 如果用户未登录并且目标路径不是登陆界面
  if (!user && to.path !== '/login') {
    sessionStorage.setItem('query', JSON.stringify(to.query))
    sessionStorage.setItem('skipToUrl', to.path)
    next({path: '/login'})
  } else if (user && overTimeFlag) {
    // 有用户信息但是 已过期
    sessionStorage.setItem('query', JSON.stringify(to.query))
    sessionStorage.setItem('skipToUrl', to.path)
    next({path: '/login'})
  } else if (to.path === '/') {
    // 目标路径不是登陆界面并且用户已登陆
    next({ path: '/Menu' })
  } else {
    next()
  }
})
FastClick.attach(document.body)
Vue.config.productionTip = false
Vue.directive('left-swipe', {
  bind(el, binding, vnode) {
    let startX;
    el.addEventListener('touchstart', function(e) {
      startX = e.changedTouches[0].clientX;
    });
    el.addEventListener('touchend', function(e) {
      const endX = e.changedTouches[0].clientX;
      if ((endX - startX > 50 && Math.abs(endX - startX) / window.innerWidth >= 0.3)) {
        console.log("向左滑");
      } else if ((startX - endX > 50 && Math.abs(startX - endX) / window.innerWidth >= 0.3)) {
        const method = binding.value.method;
        const para = binding.value.para;
        if (typeof method === 'function') {
          method(para); // 直接调用传入的方法
        } else if (typeof window[method] === 'function') {
          window[method](para); // 如果传入的是字符串形式的方法名称，则需要从window对象上查找该方法并调用
        } else {
          console.error(`无效的方法 ${method}`);
        }
      }
    });
  },
  update(el, binding, vnode){
    let startX;
    el.addEventListener('touchstart', function(e) {
      startX = e.changedTouches[0].clientX;
    });
    el.addEventListener('touchend', function(e) {
      const endX = e.changedTouches[0].clientX;
      if ((endX - startX > 50 && Math.abs(endX - startX) / window.innerWidth >= 0.3)) {
        console.log("向左滑");
      } else if ((startX - endX > 50 && Math.abs(startX - endX) / window.innerWidth >= 0.3)) {
        const method = binding.value.method;
        const para = binding.value.para;
        if (typeof method === 'function') {
          method(para); // 直接调用传入的方法
        } else if (typeof window[method] === 'function') {
          window[method](para); // 如果传入的是字符串形式的方法名称，则需要从window对象上查找该方法并调用
        } else {
          console.error(`无效的方法 ${method}`);
        }
      }
    });
  }
});
/* eslint-disable no-new */
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app-box')
