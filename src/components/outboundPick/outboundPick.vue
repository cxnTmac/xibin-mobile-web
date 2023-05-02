<template>
  <div>

    <div style="height:44px;z-index: 999">
    <sticky >
      <x-header :left-options="{preventGoBack:true}" @on-click-back = "onClickBack">出库拣货<a slot="right"  @click="scan">扫描</a></x-header>
      <search
        @on-change="changeOrderNo"
        v-model="orderNo"
        position="absolute"
        auto-scroll-to-top top="46px"
        @on-submit="onSubmit"
        placeholder="输入出库单号"
        ref="search">
      </search>
    </sticky>
    </div>
    <!--<video autoplay class="video" style="height: 400px"></video>-->
    <tab style="margin-top: 46px">
      <tab-item selected  @on-item-click="allTabClickHandler">全部</tab-item>
      <tab-item @on-item-click="unPickTabClickHandler">未拣货</tab-item>
      <tab-item @on-item-click="pickTabClickHandler">已拣货</tab-item>
    </tab>
    <div v-transfer-dom>
      <popup v-model="pickUpShow" height="270px" is-transparent>
        <div style="width: 95%;background-color:#fff;height:250px;margin:0 auto;border-radius:5px;padding-top:10px;">
          <group>
            <x-input title="拣货数" type="number" text-align="right" :required="true" v-model="pickNumInput"></x-input>
          </group>
          <div style="padding:20px 15px;">
            <x-button type="primary" @click.native="pickUpSumbmit">拣货确认</x-button>
            <x-button @click.native="pickUpShow = false">取消</x-button>
          </div>
        </div>
      </popup>
    </div>

    <div v-for="(item, index) in orderDetailAlloc" class="cardBox">
      <form-preview  class="inCard" :header-label="getLineNoLabel(item.lineNo)" :header-value="getStatus(index)" :body-items="skuDataToFormList(index)">
      </form-preview>
      <grid :rows=2>
        <grid-item class="cardItem">
          <x-button class="cardButtonLeft"  type="primary" @click.native="pickUp(index)" :disabled="btnPickUpStatus(index)">拣货</x-button>
        </grid-item>
        <grid-item class="cardItem">
          <x-button class="cardButtonRight" type="warn" @click.native="cancelPickUp(index)" :disabled="btnCancelPickUpStatus(index)">取消拣货</x-button>
        </grid-item>
      </grid>


    </div>
    <div>
      <grid :rows=3 style="margin-top: 20px">
        <!--<grid-item class="cardItem">-->
          <!--<x-button class="cardButton" @click.native="prePage"  type="primary">上一页</x-button>-->
        <!--</grid-item>-->
        <grid-item class="cardItem">
          <x-input title="" v-model="searchLineNo"></x-input>
        </grid-item>
        <!--<grid-item class="cardItem">-->
          <!--<x-button class="cardButton" @click.native="nextPage" type="primary" >下一页</x-button>-->
        <!--</grid-item>-->
      </grid>
    </div>


  </div>
</template>

<script>
  import wx from 'weixin-js-sdk'
import {Tab, TabItem, TransferDom, Popup, FormPreview, Grid, GridItem, XSwitch, Group, Cell, XInput, XButton, Alert, AlertPlugin, Divider, Panel, PopupPicker, XHeader, Search, Sticky, Loading, LoadingPlugin, Toast, ToastPlugin} from 'vux'
// import {requestLogin} from '../api/sysApi'
// import {getFittingTypeList} from '../../api/fittingTypeApi'
// import {getFittingSkuListPage} from '../../api/fittingSkuApi'
// import {getFittingModelList} from '../../api/modelApi'
import {getOutboundAllocListPage, pick, cancelPick} from '../../api/outboundApi'
import {requestAccessToken} from '../../api/sysApi'
import Vue from 'vue'
import axios from 'axios'
import util from '../../../common/js/util'
var codemaster = require('../../../static/codemaster.json')
Vue.use(AlertPlugin)
Vue.use(LoadingPlugin)
Vue.use(ToastPlugin)
export default {
    directives: {
      TransferDom
    },
    components: {
      Tab,
      TabItem,
      Popup,
      FormPreview,
      Grid,
      GridItem,
      XSwitch,
      Group,
      Cell,
      XInput,
      XButton,
      Alert,
      AlertPlugin,
      Divider,
      Panel,
      PopupPicker,
      XHeader,
      Search,
      Sticky,
      Loading,
      LoadingPlugin,
      Toast,
      ToastPlugin
    },
    data () {
      return {
        searchLineNo: '',
        orderNo: '',
        orderDetailAlloc: [],
        page: 1,
        size: 999,
        total: 0,
        listLoading: false,
        sels: [],
        pickUpShow: false,
        pickNumInput: 0,
        currentIndex: 0,
        multiStatus: "'40'" + ',' + "'60'" + ',' + "'65'"
      }
    },
    methods: {
      getLineNoLabel (lineNo) {
        return '行号：' + lineNo
      },
      scan () {
        window.xbjgApp.startQrcodeScan()
      },
      onQrcodeScanResult (scanResult) {
        this.orderNo = scanResult
        alert(scanResult)
        this.onSubmit()
      },
      changeOrderNo (orderNo) {
        this.orderNo = orderNo
      },
      allTabClickHandler: function () {
        this.multiStatus = "'40'" + ',' + "'60'" + ',' + "'65'"
        this.getDetailAllocs()
      },
      unPickTabClickHandler: function () {
        this.multiStatus = "'40'"
        this.getDetailAllocs()
      },
      pickTabClickHandler: function () {
        this.multiStatus = "'60'" + ',' + "'65'"
        this.getDetailAllocs()
      },
      btnPickUpStatus: function (index) {
        if (this.orderDetailAlloc[index].status === '40') {
          return false
        } else if (this.orderDetailAlloc[index].status === '60' || this.orderDetailAlloc[index].status === '65') {
          return true
        }
      },
      btnCancelPickUpStatus: function (index) {
        if (this.orderDetailAlloc[index].status === '40') {
          return true
        } else if (this.orderDetailAlloc[index].status === '60' || this.orderDetailAlloc[index].status === '65') {
          return false
        }
      },
      onClickBack () {
        this.$router.push({path: '/menu/'})
      },
      getStatus: function (index) {
        return util.getComboNameByValue(codemaster.WM_OUTBOUND_STATUS, this.orderDetailAlloc[index].status)
      },
      skuDataToFormList: function (index) {
        let list = []
        if (this.orderDetailAlloc[index] !== null) {
          list.push({label: '产品编码', value: this.orderDetailAlloc[index].skuCode})
          list.push({label: '产品名称', value: this.orderDetailAlloc[index].skuName})
          list.push({label: '车型', value: this.orderDetailAlloc[index].modelCode})
          list.push({label: '状态', value: this.orderDetailAlloc[index].status})
          list.push({label: '库位', value: this.orderDetailAlloc[index].allocLocCode})
          list.push({label: '数量', value: this.orderDetailAlloc[index].outboundNum})
        }
        return list
      },
      getDetailAllocs () {
        if (this.orderNo === undefined || this.orderNo === null || this.orderNo === '') {
          this.$vux.toast.text('请输入出库单号进行查询', 'buttom')
          return
        }
        let para = {
          page: this.page,
          size: this.size,
          conditions: JSON.stringify({orderNo: this.orderNo, multiStatus: this.multiStatus, orderByConditions: 'order by woa.alloc_loc_code,woa.sku_code,woa.line_no+0'})
        }
        getOutboundAllocListPage(para).then((res) => {
          this.total = res.data.size
          this.orderDetailAlloc = res.data.list
        }).catch((data) => {
          util.errorCallBack(data, this.$router)
        })
      },
      onSubmit () {
        // 重置页码为第一页
        this.page = 1
        this.orderDetailAlloc = []
        this.getDetailAllocs()
      },
      pickUp (index) {
        this.pickUpShow = true
        this.currentIndex = index
        this.pickNumInput = this.orderDetailAlloc[index].pickNum
      },
      pickUpSumbmit () {
        if (this.pickNumInput < this.orderDetailAlloc[this.currentIndex].outboundNum) {
          this.$vux.toast.text('只能超量或者等量拣货', 'buttom');
          return
        }
        let para = Object.assign({}, this.orderDetailAlloc[this.currentIndex])
        pick({alloc: JSON.stringify(para), pickNum: this.pickNumInput}).then((res) => {
          this.$vux.toast.text(res.data.msg, 'buttom')
          this.pickUpShow = false
          if (res.data.code === 200) {
            this.getDetailAllocs()
          }
        }).catch((data) => {
          util.errorCallBack(data, this.$router)
        })
      },
      cancelPickUp (index) {
        let para = Object.assign({}, this.orderDetailAlloc[index])
        cancelPick({alloc: JSON.stringify(para)}).then((res) => {
          this.$vux.toast.text(res.data.msg, 'buttom')
          if (res.data.code === 200) {
            this.getDetailAllocs()
          }
        }).catch((data) => {
          util.errorCallBack(data, this.$router)
        })
      },
      nextPage () {
        let totalPage = Math.ceil(this.total / this.size)
        if (this.page >= 1 && this.page < totalPage) {
          this.page++
          this.getDetailAllocs()
        } else if (this.page === totalPage) {
          this.$vux.toast.text('已经是最后一页了', 'buttom')
        }
      },
      prePage () {
        let totalPage = Math.ceil(this.total / this.size)
        if (this.page > 1 && this.page <= totalPage) {
          this.page--
          this.getDetailAllocs()
        } else if (this.page === 1) {
          this.$vux.toast.text('已经是第一页了', 'buttom')
        }
      }
    },
    created () {
      window.onQrcodeScanResult = this.onQrcodeScanResult
      this.page = 1
    },
    mounted () {
      this.orderNo = this.$route.query.orderNo
      if (this.orderNo === undefined || this.orderNo === null || this.orderNo === '') {
        this.$vux.toast.text('请输入出库单号进行查询', 'buttom')
      } else {
        this.getDetailAllocs()
      }
    }
}
</script>

<style>
  .cardItem{
    padding: 0px;
  }
  .cardButton{
    border: 0px;
    margin: 0px;
    border-radius:0;
  }
  .cardButtonLeft{
    margin: 0px;
    border-top-left-radius:0;
    border-top-right-radius:0;
    border-bottom-right-radius:0;
    border-bottom-left-radius:10px;
  }
  .cardButtonRight{
    margin: 0px;
    border-top-left-radius:0;
    border-top-right-radius:0;
    border-bottom-left-radius:0;
    border-bottom-right-radius:10px;
  }
  .inCard{
    border-radius:5px;

  }
  .cardTitle{
    box-shadow:2px 2px 2px #B3B3B3;
    padding: 0px;
    border-radius:5px;
    margin-top: 15px;
    margin-buttom: 15px;
    margin-left: 10px;
    margin-right: 10px;
  }
 .cardBox{
   box-shadow:2px 2px 2px #B3B3B3;
   border-radius:10px;
   margin-top: 15px;
   margin-buttom: 15px;
   margin-left: 10px;
   margin-right: 10px;
 }


</style>
