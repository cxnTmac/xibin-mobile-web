<template>
  <div>
    <sticky>
    <x-header :left-options="{preventGoBack:true, showBack: false}" :right-options="{showMore: true}" @on-click-more="showMenus = true">功能菜单</x-header>
    </sticky>
    <grid :rows="3">
      <grid-item  label="产品" link="/fittingTypeSelect" >
        <img slot="icon" src="../../static/icon/doc.png">
      </grid-item>
      <grid-item label="出库拣货" link="/outboundPickSelect" >
        <img slot="icon" src="../../static/icon/audit.png">
      </grid-item>
      <grid-item label="出库发货" link="/outboundShip" >
        <img slot="icon" src="../../static/icon/contrail.png">
      </grid-item>
      <grid-item v-if="currentUserName === 'cqx'" label="数据图表" link="/charts" >
        <img slot="icon" src="../../static/icon/sale.png">
      </grid-item>
      <grid-item label="入库收货" link="/inbound" >
        <img slot="icon" src="../../static/icon/report.png">
      </grid-item>
      <grid-item label="扫码出库" link="/outboundScanSelect" >
        <img slot="icon" src="../../static/icon/operation.png">
      </grid-item>
    </grid>
  </div>
</template>

<script>
import {Group, Cell, XInput, XButton, Alert, AlertPlugin, Grid, GridItem, Divider, XHeader, Sticky, Actionsheet, TransferDom} from 'vux'
// import {requestLogin} from '../api/sysApi'
import Vue from 'vue'
Vue.use(AlertPlugin)
export default {
  directives: {
    TransferDom
  },
  components: {
    Group,
    Cell,
    XInput,
    XButton,
    Alert,
    AlertPlugin,
    Grid,
    GridItem,
    Divider,
    XHeader,
    Sticky,
    Actionsheet
  },
  data () {
    return {
      currentUserName:"",
      menus: {
        menu1: 'Take Photo',
        menu2: 'Choose from photos'
      },
      showMenus: false
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
    }
  },
  methods: {
  },
  mounted() {
    this.currentUserName = localStorage.getItem('userName');
  }
}
</script>

<style>

</style>
