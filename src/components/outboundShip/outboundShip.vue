<template>
  <div>

    <div style="height:44px;z-index: 999">
      <sticky>
        <x-header :left-options="{preventGoBack:true}" @on-click-back="onClickBack">出库发货<a slot="right" @click="scan">扫描</a></x-header>
        <search @on-change="changeOrderNo" v-model="orderNo" position="absolute" auto-scroll-to-top top="46px"
          @on-submit="onSubmit" placeholder="输入出库单号" ref="search">
          <!--<slots name="right"><x-button @click.native="scan">扫描</x-button></slots>-->
        </search>
        <x-button type="primary" mini>primary</x-button>
      </sticky>
    </div>
    <!--<video autoplay class="video" style="height: 400px"></video>-->

    <tab style="margin-top: 46px">
      <tab-item selected @on-item-click="allTabClickHandler">全部</tab-item>
      <tab-item @on-item-click="unShipTabClickHandler">未发货</tab-item>
      <tab-item @on-item-click="shipTabClickHandler">已发货</tab-item>
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
    <div v-for="(item, index) in orders" class="cardBox">
      <form-preview class="inCard" header-label="发货信息" :header-value="getStatus(index)" :body-items="skuDataToFormList(index)">
      </form-preview>
      <grid :rows=2>
        <grid-item class="cardItem">
          <x-button class="cardButtonLeft" type="primary" @click.native="ship(index)" :disabled="btnShipStatus(index)">发货</x-button>
        </grid-item>
        <grid-item class="cardItem">
          <x-button class="cardButtonRight" type="warn" @click.native="cancelShip(index)" :disabled="btnCancelShipStatus(index)">取消发货</x-button>
        </grid-item>
      </grid>


    </div>
    <div>
      <grid :rows=2 style="margin-top: 20px">
        <grid-item class="cardItem">
          <x-button class="cardButton" @click.native="prePage" type="primary">上一页</x-button>
        </grid-item>
        <grid-item class="cardItem">
          <x-button class="cardButton" @click.native="nextPage" type="primary">下一页</x-button>
        </grid-item>
      </grid>
    </div>


  </div>
</template>

<script>
  import {
    Tab,
    TabItem,
    TransferDom,
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
  } from 'vux'
  // import {requestLogin} from '../api/sysApi'
  // import {getFittingTypeList} from '../../api/fittingTypeApi'
  // import {getFittingSkuListPage} from '../../api/fittingSkuApi'
  // import {getFittingModelList} from '../../api/modelApi'
  import {
    getOutboundOrderListPage,
    shipByHeader,
    cancelShipByHeader
  } from '../../api/outboundApi'
  import Vue from 'vue'
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
    data() {
      return {
        orderNo: '',
        orders: [],
        page: 1,
        size: 5,
        total: 0,
        listLoading: false,
        sels: [],
        pickUpShow: false,
        pickNumInput: 0,
        currentIndex: 0,
        multiStatus: "'60'" + ',' + "'80'"
      }
    },
    methods: {
      scan() {
        if(!this.isWx()){
          window.xbjgApp.startQrcodeScan()
        }else{
          var _this = this
          wx.scanQRCode({
            needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
            scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
            success: function (res) {
              _this.orderNo = res.resultStr // 当needResult 为 1 时，扫码返回的结果
              alert(res.resultStr)
              _this.onSubmit()
            }
          });
        } 
      },
      onQrcodeScanResult(scanResult) {
        this.orderNo = scanResult
        alert(scanResult)
        this.onSubmit()
      },
      changeOrderNo(orderNo) {
        this.orderNo = orderNo
      },
      allTabClickHandler: function () {
        this.multiStatus = "'60'" + ',' + "'80'"
        this.getOrders()
      },
      unShipTabClickHandler: function () {
        this.multiStatus = "'60'"
        this.getOrders()
      },
      shipTabClickHandler: function () {
        this.multiStatus = "'80'"
        this.getOrders()
      },
      btnShipStatus: function (index) {
        if (this.orders[index].status === '60') {
          return false
        } else if (this.orders[index].status === '80') {
          return true
        }
      },
      btnCancelShipStatus: function (index) {
        if (this.orders[index].status === '60') {
          return true
        } else if (this.orders[index].status === '80') {
          return false
        }
      },
      onClickBack() {
        this.$router.push({
          path: '/menu/'
        })
      },
      getStatus: function (index) {
        return util.getComboNameByValue(codemaster.WM_OUTBOUND_STATUS, this.orders[index].status)
      },
      skuDataToFormList: function (index) {
        let list = []
        if (this.orders[index] !== null) {
          list.push({
            label: '出库单号',
            value: this.orders[index].orderNo
          })
          list.push({
            label: '客户编码',
            value: this.orders[index].buyerCode
          })
          list.push({
            label: '客户名称',
            value: this.orders[index].buyerName
          })
        }
        return list
      },
      getOrders() {
        let para = {
          page: this.page,
          size: this.size,
          conditions: JSON.stringify({
            orderNo: this.orderNo,
            multiStatus: this.multiStatus
          })
        }
        getOutboundOrderListPage(para).then((res) => {
          this.total = res.data.size
          this.orders = res.data.list
        }).catch((data) => {
          util.errorCallBack(data, this.$router)
        })
      },
      onSubmit() {
        // 重置页码为第一页
        this.page = 1
        this.orders = []
        this.getOrders()
      },
      ship(index) {
        shipByHeader({
          orderNo: this.orders[index].orderNo
        }).then((res) => {
          this.$vux.toast.text(res.data.msg, 'buttom')
          if (res.data.code === 200) {
            this.getOrders()
          }
        }).catch((data) => {
          util.errorCallBack(data, this.$router)
        })
      },
      cancelShip(index) {
        cancelShipByHeader({
          orderNo: this.orders[index].orderNo
        }).then((res) => {
          this.$vux.toast.text(res.data.msg, 'buttom')
          if (res.data.code === 200) {
            this.getOrders()
          }
        }).catch((data) => {
          util.errorCallBack(data, this.$router)
        })
      },
      nextPage() {
        let totalPage = Math.ceil(this.total / this.size)
        if (this.page >= 1 && this.page < totalPage) {
          this.page++
          this.getOrders()
        } else if (this.page === totalPage) {
          this.$vux.toast.text('已经是最后一页了', 'buttom')
        }
      },
      prePage() {
        let totalPage = Math.ceil(this.total / this.size)
        if (this.page > 1 && this.page <= totalPage) {
          this.page--
          this.getOrders()
        } else if (this.page === 1) {
          this.$vux.toast.text('已经是第一页了', 'buttom')
        }
      }
    },
    mounted() {
      this.orderNo = this.$route.query.orderNo
      this.getOrders()
      requestAccessToken({url: encodeURIComponent((window.location.href).split('#')[0])}).then((res) => {
       wx.config({
         // debug: true, // 开启调试模式,
         appId: res.data.appId, // 必填，企业号的唯一标识，此处填写企业号corpid
         timestamp: res.data.timestamp, // 必填，生成签名的时间戳
         nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
         signature: res.data.signature, // 必填，签名，见附录1
         jsApiList: ['scanQRCode'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
       })
     }).catch((data) => {
       console.log(data)
     })
    },
    created() {
      window.onQrcodeScanResult = this.onQrcodeScanResult
    }
  }

</script>

<style>
  .cardItem {
    padding: 0px;
  }

  .cardButton {
    border: 0px;
    margin: 0px;
    border-radius: 0;
  }

  .cardButtonLeft {
    margin: 0px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 10px;
  }

  .cardButtonRight {
    margin: 0px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 10px;
  }

  .inCard {
    border-radius: 5px;

  }

  .cardTitle {
    box-shadow: 2px 2px 2px #B3B3B3;
    padding: 0px;
    border-radius: 5px;
    margin-top: 15px;
    margin-buttom: 15px;
    margin-left: 10px;
    margin-right: 10px;
  }

  .cardBox {
    box-shadow: 2px 2px 2px #B3B3B3;
    border-radius: 10px;
    margin-top: 15px;
    margin-buttom: 15px;
    margin-left: 10px;
    margin-right: 10px;
  }

</style>
