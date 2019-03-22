import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import inbound from './modules/inbound'
import basicdata from './modules/basicdata'

Vue.use(Vuex)

// 创建 store 实例
export default new Vuex.Store({
  actions,
  getters,
  modules: {
    'inbound': inbound,
    'basicdata': basicdata
  }
})
