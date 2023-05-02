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
import outboundDetail from '@/components/outboundShip/outboundDetail'
import inbound from '@/components/inboundReceive/inbound'
import inboundReceive from '@/components/inboundReceive/inboundReceive'
import charts from '@/components/charts/charts'
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
    path: '/outboundDetail',
    name: '发货明细',
    component: outboundDetail
  },
  {
    path: '/inbound',
    name: '入库单',
    component: inbound
  },
  {
    path: '/inboundReceive',
    name: '入库收货',
    component: inboundReceive
  },
  {
    path: '/login',
    name: '登陆',
    component: Login
  },
  {
    path: '/charts',
    name: '数据图表',
    component: charts
  }
]
export default routes
