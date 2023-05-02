<template>
  <div>
    <div style="height: 44px; z-index: 999">
      <sticky>
        <x-header
          :left-options="{ preventGoBack: true }"
          @on-click-back="onClickBack"
          >出库单明细</x-header
        >
        <!-- <a slot="right" @click="scan">扫描</a> -->
        <!-- <search
          @on-change="changeOrderNo"
          v-model="orderNo"
          position="absolute"
          auto-scroll-to-top
          top="46px"
          @on-submit="onSubmit"
          placeholder="输入出库单号"
          ref="search"
        >
        </search> -->
      </sticky>
    </div>
    <!--<video autoplay class="video" style="height: 400px"></video>-->
    <tab style="margin-top: 0px">
      <tab-item selected @on-item-click="allTabClickHandler">全部</tab-item>
      <tab-item @on-item-click="unShipTabClickHandler">未发货</tab-item>
    </tab>
    <x-table>
      <thead>
        <tr class="FONT-ORDERHEADER">
          <th style="width: 10%">订单号</th>
          <th style="width: 60%">客户</th>
          <th style="width: 10%">状态</th>
          <th v-if="currentUserName === 'cqx'" style="width: 10%">总价</th>
        </tr>
      </thead>
      <tbody>
        <tr class="FONT-ORDERHEADER-BODY">
          <td>{{ orderNo }}</td>
          <td>{{ customerName }}</td>
          <td>{{ status }}</td>
          <td  v-if="currentUserName === 'cqx'">{{ totalPrice }}</td>
        </tr>
      </tbody>
    </x-table>
    <div>
      <x-table>
        <thead>
          <tr class="FONT-HEADER">
            <th style="width: 6%">NO</th>
            <th style="width: 14%">产品编码</th>
            <th>产品名称</th>
            <th>车型</th>
            <th>数量</th>
            <th style="width: 10%" v-if="currentUserName === 'cqx'">价格</th>
            <th style="width: 10%">状态</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, index) in orderDetail">
          <tr
            v-bind:key="index"
            @click="pickUpOrCancel(item, index)"
            class="FONT"
          >
            <td>{{ item.lineNo }}</td>
            <td>{{ item.skuCode }}</td>
            <td>{{ item.skuName }}</td>
            <td>{{ item.modelCode }}</td>
            <td>{{ item.outboundNum }}</td>
            <td v-if="currentUserName === 'cqx'">{{ item.outboundPrice }}</td>
            <td>{{ getStatus(item.status) }}</td>
          </tr>
          </template>
        </tbody>
      </x-table>
    </div>
  </div>
</template>

<script>
import wx from "weixin-js-sdk";
import {
  XTable,
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
  ToastPlugin,
} from "vux";
// import {requestLogin} from '../api/sysApi'
// import {getFittingTypeList} from '../../api/fittingTypeApi'
// import {getFittingSkuListPage} from '../../api/fittingSkuApi'
// import {getFittingModelList} from '../../api/modelApi'
import {
  getOutboundDetailListPage,
  getOutboundAllocListPage,
  pick,
  cancelPick
} from "../../api/outboundApi";
import { requestAccessToken } from "../../api/sysApi";
import Vue from "vue";
import axios from "axios";
import util from "../../../common/js/util";
import NP from "number-precision";
var codemaster = require("../../../static/codemaster.json");
Vue.use(AlertPlugin);
Vue.use(LoadingPlugin);
Vue.use(ToastPlugin);
export default {
  directives: {
    TransferDom,
  },
  components: {
    XTable,
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
    ToastPlugin,
  },
  data() {
    return {
      currentUserName:"",
      searchLineNo: "",
      orderNo: "",
      customerName: "",
      status: "",
      page: 1,
      size: 999,
      total: 0,
      pickUpShow: false,
      pickNumInput: 0,
      currentIndex: 0,
      orderDetail: [],
      detailMultiStatus: null,
      detailPage: 1,
      detailSize: 999,
      detailTotal: 0,
    };
  },
  computed: {
    totalPrice: function () {
      let totalPrice = 0;
      this.orderDetail.forEach((row, index) => {
        totalPrice = NP.plus(
          totalPrice,
          NP.times(row.outboundPrice, row.outboundNum)
        );
      });
      return totalPrice;
    }
  },
  methods: {
    getStatus: function (status) {
      return util.getComboNameByValue(
        codemaster.WM_OUTBOUND_STATUS,
        status
      );
    },
    isWx() {
      //window.navigator.userAgent属性包含了浏览器类型、版本、操作系统类型、浏览器引擎类型等信息，这个属性可以用来判断浏览器类型
      var ua = window.navigator.userAgent.toLowerCase();
      //通过正则表达式匹配ua中是否含有MicroMessenger字符串
      if (ua.match(/MicroMessenger/i) == "micromessenger") {
        return true;
      } else {
        return false;
      }
    },
    scan() {
      if (!this.isWx()) {
        window.xbjgApp.startQrcodeScan();
      } else {
        var _this = this;
        wx.scanQRCode({
          needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
          success: function (res) {
            _this.orderNo = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
            alert(res.resultStr);
            _this.onSubmit();
          },
        });
      }
    },
    onQrcodeScanResult(scanResult) {
      this.orderNo = scanResult;
      alert(scanResult);
      this.onSubmit();
    },
    changeOrderNo(orderNo) {
      this.orderNo = orderNo;
    },
    allTabClickHandler: function () {
      this.multiStatus = null;
      this.pickViewVisible = true;
      this.unAllocViewVisible = false;
      this.getDetails();
    },
    unShipTabClickHandler: function () {
      this.multiStatus =
        "'40'" + "," + "'50'" + "," + "'60'" + "," + "'70'" + "," + "'00'";
      this.pickViewVisible = true;
      this.unAllocViewVisible = false;
      this.getDetails();
    },
    onClickBack() {
      this.$router.push({ path: "/outboundShip/" });
    },
    getDetails() {
      if (
        this.orderNo === undefined ||
        this.orderNo === null ||
        this.orderNo === ""
      ) {
        this.$vux.toast.text("请输入出库单号进行查询", "buttom");
        return;
      }
      let para = {
        page: this.detailPage,
        size: this.detailSize,
        conditions: JSON.stringify({
          orderNo: this.orderNo,
          multiStatus: this.multiStatus,
        }),
      };
      getOutboundDetailListPage(para)
        .then((res) => {
          this.detailTotal = res.data.size;
          this.orderDetail = res.data.list;
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
    },
    onSubmit() {
      // 重置页码为第一页
      this.page = 1;
      this.detailPage = 1;
      this.orderDetail = [];
      this.getDetails();
    }
  },
  created() {
    window.onQrcodeScanResult = this.onQrcodeScanResult;
    this.page = 1;
  },
  mounted() {
    this.currentUserName = localStorage.getItem('userName');
    this.orderNo = this.$route.query.orderNo;
    this.customerName = this.$route.query.customerName;
    this.status = this.$route.query.status;
    if (
      this.orderNo === undefined ||
      this.orderNo === null ||
      this.orderNo === ""
    ) {
      this.$vux.toast.text("请输入出库单号进行查询", "buttom");
    } else {
      this.getDetails();
    }
    requestAccessToken({
      url: encodeURIComponent(window.location.href.split("#")[0]),
    })
      .then((res) => {
        wx.config({
          // debug: true, // 开启调试模式,
          appId: res.data.appId, // 必填，企业号的唯一标识，此处填写企业号corpid
          timestamp: res.data.timestamp, // 必填，生成签名的时间戳
          nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
          signature: res.data.signature, // 必填，签名，见附录1
          jsApiList: ["scanQRCode"], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
      })
      .catch((data) => {
        console.log(data);
      });
  },
};
</script>

<style>
.FONT-HEADER {
  font-size: 10px;
  background-color: #003057;
  color: #fff;
}
.FONT-ORDERHEADER {
  font-size: 10px;
  background-color: #003057;
  color: #fff;
}
.FONT-ORDERHEADER-BODY {
  line-height: 20px;
  font-size: 10px;
}
.FONT {
  line-height: 28px;
  font-size: 14px;
}
</style>
