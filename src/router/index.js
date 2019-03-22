import Vue from 'vue'
import Router from 'vue-router'
// import Hello from '@/components/Hello'
import Menu from '@/components/Menu'
import Login from '@/components/Login'
import fittingTypeSelect from '@/components/basicdata/fittingTypeSelect'
import fittingSkuSelect from '@/components/basicdata/fittingSkuSelect'
import fittingSkuShow from '@/components/basicdata/fittingSkuShow'
import outboundPick from '@/components/outboundPick/outboundPick'
import outboundPick2 from '@/components/outboundPick2/outboundPick2'
import outboundShip from '@/components/outboundShip/outboundShip'
Vue.use(Router)
let routes = [
  {
    path: '/menu',
    name: '菜单',
    component: Menu
  },
  {
    path: '/fittingTypeSelect',
    name: '配件类别选择',
    component: fittingTypeSelect
  },
  {
    path: '/fittingSkuSelect',
    name: '产品选择',
    component: fittingSkuSelect
  },
  {
    path: '/fittingSkuShow',
    name: '产品展示',
    component: fittingSkuShow
  },
  {
    path: '/outboundPick',
    name: '出库拣货',
    component: outboundPick
  },
  {
    path: '/outboundPick2',
    name: '出库拣货',
    component: outboundPick2
  },
  {
    path: '/outboundShip',
    name: '发货',
    component: outboundShip
  },
  {
    path: '/login',
    name: '登陆',
    component: Login
  }
]
export default routes
