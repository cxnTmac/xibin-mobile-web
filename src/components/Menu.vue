<template>
  <div>
    <sticky>
      <x-header :left-options="{ preventGoBack: true, showBack: false }" :right-options="{ showMore: true }"
        @on-click-more="showMenus = true">功能菜单</x-header>
    </sticky>
    <div v-transfer-dom>
      <popup v-model="showMenus" height="150px" is-transparent>
        <div style="
            width: 95%;
            background-color: #fff;
            height: 100px;
            margin: 0 auto;
            border-radius: 5px;
            padding-top: 10px;
          ">
          <div style="padding: 20px 15px">
            <x-button type="warn" @click.native="logout">登出:{{currentUserName}}</x-button>
          </div>
        </div>
      </popup>
    </div>
    <grid :cols="2">  
      <grid-item label="产品" link="/fittingTypeSelect">
        <img slot="icon" src="../../static/icon/doc.png">
      </grid-item>
      <grid-item label="出库拣货" link="/outboundPickSelect">
        <img slot="icon" src="../../static/icon/audit.png">
      </grid-item>
      <grid-item label="出库发货" link="/outboundShip">
        <img slot="icon" src="../../static/icon/contrail.png">
      </grid-item>
      <grid-item label="数据图表" link="/charts">
        <img slot="icon" src="../../static/icon/sale.png">
      </grid-item>
      <grid-item label="入库收货" link="/inbound">
        <img slot="icon" src="../../static/icon/report.png">
      </grid-item>
      <grid-item label="扫码出库" link="/outboundScanSelect">
        <img slot="icon" src="../../static/icon/operation.png">
      </grid-item>
      <grid-item label="销售收款情况" link="/outboundPayment">
        <img slot="icon" src="../../static/icon/customer.png">
      </grid-item>
    </grid>
  </div>

</template>

<script>
import { Group, Cell, XInput, XButton, Alert, AlertPlugin, Grid, GridItem, Divider, XHeader, Sticky, Actionsheet, TransferDom,Popup} from 'vux'
// import {requestLogin} from '../api/sysApi'
import Vue from 'vue'
import { logout } from '../api/sysApi'
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
    Actionsheet,
    Popup,
  },
  data() {
    return {
      currentUserName: "",
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
    logout() {
      var _this = this;
      logout().then((data) => {
        let { msg, code } = data;
        localStorage.removeItem("user");
          _this.$router.push("/login");
        if (code !== 200) {
          this.$vux.toast.show({
            text: '登出失败', type: 'cancel'
          });
        }
      }).catch((data) => {
        console.log(data);
          localStorage.removeItem("user");
          _this.$router.push("/login");
      });
    }
  },
  mounted() {
    this.currentUserName = JSON.parse(localStorage.getItem('user')).username;
  }
}
</script>

<style></style>
