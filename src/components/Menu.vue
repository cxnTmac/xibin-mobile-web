<template>
  <div>
    <sticky>
    <x-header :left-options="{preventGoBack:true, showBack: false}" :right-options="{showMore: true}" @on-click-more="showMenus = true">功能菜单</x-header>
    </sticky>
    <grid :rows="3">
      <grid-item label="产品" link="/fittingTypeSelect" >
        <img slot="icon" src="../../static/icon/sale.png">
      </grid-item>
      <grid-item label="出库拣货" link="/outboundPick" >
        <img slot="icon" src="../../static/icon/sale.png">
      </grid-item>
      <grid-item label="出库拣货2" link="/outboundPick2" >
        <img slot="icon" src="../../static/icon/sale.png">
      </grid-item>
      <grid-item label="出库发货" link="/outboundShip" >
        <img slot="icon" src="../../static/icon/sale.png">
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
  }
}
</script>

<style>

</style>
