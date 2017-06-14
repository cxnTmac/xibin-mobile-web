<template>
  <div>
    <x-header :left-options="{preventGoBack:true}" @on-click-back = "onClickBack">功能菜单</x-header>
    <grid :rows="3">
      <grid-item label="产品" link="/fittingTypeSelect" icon="../../static/icon/销售.png">

      </grid-item>
    </grid>
  </div>
</template>

<script>
import {Group, Cell, XInput, XButton, Alert, AlertPlugin, Grid, GridItem, Divider, XHeader} from 'vux'
// import {requestLogin} from '../api/sysApi'
import Vue from 'vue'
Vue.use(AlertPlugin)
export default {
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
    XHeader
  },
  data () {
    return {
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
