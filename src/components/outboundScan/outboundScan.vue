<template>
  <div>
    <div style="height: 44px; z-index: 999">
      <sticky>
        <x-header :left-options="{ preventGoBack: true }" @on-click-back="onClickBack">出库扫码明细<a slot="right"
            @click="scan">扫描</a></x-header>
        <search @on-change="onSkuQueryChange" v-model="skuQuery" position="absolute" auto-scroll-to-top top="46px"
          @on-submit="onSubmit" placeholder="输入产品编码" ref="search">
        </search>
      </sticky>
    </div>
    <x-table style="margin-top:46px">
      <thead>
        <tr class="FONT-ORDERHEADER">
          <th style="width: 10%">订单号</th>
          <th style="width: 60%">客户</th>
          <th style="width: 10%">状态</th>
          <th style="width: 10%">总价</th>
        </tr>
      </thead>
      <tbody>
        <tr class="FONT-ORDERHEADER-BODY">
          <td>{{ orderNo }}</td>
          <td>{{ customerName }}</td>
          <td>{{ status }}</td>
          <td>{{ totalPrice }}</td>
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
            <th style="width: 10%">价格</th>
            <th style="width: 10%">状态</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, index) in orderDetail">
            <tr v-bind:key="index" @click="editDetail(item)" :class="getTrClass(item)" :ref="item.skuCode"
              :id="item.skuCode">
              <td>{{ item.lineNo }}</td>
              <td>{{ item.skuCode }}</td>
              <td>{{ item.skuName }}</td>
              <td>{{ item.modelCode }}</td>
              <td>{{ item.outboundNum }}</td>
              <td>{{ item.outboundPrice }}</td>
              <td>{{ getStatus(item.status) }}</td>
            </tr>
          </template>
        </tbody>
      </x-table>
    </div>
    <div v-transfer-dom>
      <popup v-model="editShow" height="290px" is-transparent>
        <div style="
            width: 95%;
            background-color: #fff;
            height: 280px;
            margin: 0 auto;
            border-radius: 5px;
            padding-top: 10px;
          ">
          <div style="margin-left: 3%">
            <flexbox>
              <flexbox-item :span="3"><x-button mini type="primary">{{ currentSkuCode }}</x-button></flexbox-item>
              <flexbox-item>
                <div>{{ currentSkuName }}</div>
                <div>{{ currentModelCode }}</div>
              </flexbox-item>

            </flexbox>
          </div>
          <group>
            <!--:max="orderDetailAlloc[currentIndex].outboundNum"  -->
            <x-number title="发货数:" :min="0.5" :step="0.5" v-model="outboundNumInput" fillable></x-number>
          </group>
          <div style="padding: 20px 15px">
            <x-button type="primary" @click.native="editSubmit(1)">增加</x-button>
            <x-button type="warn" @click.native="editSubmit(-1)">减少</x-button>
          </div>
        </div>
      </popup>
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
  XNumber,
  Flexbox, FlexboxItem
} from "vux";
// import {requestLogin} from '../api/sysApi'
// import {getFittingTypeList} from '../../api/fittingTypeApi'
// import {getFittingSkuListPage} from '../../api/fittingSkuApi'
// import {getFittingModelList} from '../../api/modelApi'
import {
  getOutboundDetailListPage,
  getOutboundAllocListPage,
  pick,
  cancelPick,
  mobileScanSaveOutboundDetail
} from "../../api/outboundApi";
import { requestAccessToken } from "../../api/sysApi";
import Vue from "vue";
import axios from "axios";
import util from "../../../common/js/util.js";
import NP from "number-precision";
import { getSkuBySkuCode } from "../../api/fittingSkuApi";
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
    XNumber,
    Flexbox, FlexboxItem
  },
  data() {
    return {
      currentUserName: "",
      searchLineNo: "",
      skuQuery: "",
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
      multiStatus: "00",
      detailPage: 1,
      detailSize: 999,
      detailTotal: 0,
      currentSkuCode: "",
      currentSkuName: "",
      currentModelCode: "",
      editShow: false,
      outboundNumInput: 1,
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
    },
  },
  methods: {
    getTrClass(item) {
      if (item['mark'] === undefined) {
        return "FONT";
      } else if (item['mark'] === 1) {
        return "FONT-ADD";
      } else if (item['mark'] === -1) {
        return "FONT-MINUS";
      }
    },
    getStatus(status) {
      return util.getComboNameByValue(codemaster.WM_OUTBOUND_STATUS, status);
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
    getUrlParams(url) {
      const reg = /(\w+)=([^&]+)/g;
      const params = {};
      let match;
      while ((match = reg.exec(url)) !== null) {
        params[match[1]] = match[2];
      }
      return params;
    },
    scan() {
      if (!this.isWx()) {
        window.xbjgApp.startQrcodeScan();
        // 测试代码
        // let result = "https://www.jjxbjg.com/?skuCode=L264";
        // this.onQrcodeScanResult(result);
        // this.$vux.toast.text("非微信浏览器暂不支持扫描");
      } else {
        var _this = this;
        wx.scanQRCode({
          needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
          success: function (res) {
            alert(res.resultStr);
            _this.onQrcodeScanResult(res.resultStr);
          },
        });
      }
    },
    editDetail(item) {
      this.currentSkuCode = item.skuCode;
      this.currentSkuName = item.skuName;
      this.currentModelCode = item.modelCode;
      this.editShow = true;
    },
    onQrcodeScanResult(scanResult) {
      let params = this.getUrlParams(scanResult);
      const idTarget = document.getElementById(params.skuCode);
      if (idTarget !== undefined && idTarget !== null) {
        idTarget.scrollIntoView();
      }
      if (params.skuCode !== undefined && params.skuCode !== null && params.skuCode !== '') {
        this.$vux.loading.show({
          text: '请稍等...'
        });
        getSkuBySkuCode({ skuCode: params.skuCode })
          .then((res) => {
            this.$vux.loading.hide();
            if (res.data !== null) {
              this.currentSkuCode = res.data.fittingSkuCode;
              this.currentSkuName = res.data.fittingSkuName;
              this.currentModelCode = res.data.modelCode;
              this.editShow = true;

            }
          })
          .catch((data) => {
            this.$vux.loading.hide();
            util.errorCallBack(data, this.$router);
          });
      } else {
        this.$vux.toast.text("扫描结果为空");
      }

    },
    editSubmit(flag) {
      let para = { skuCode: this.currentSkuCode, orderNo: this.orderNo, outboundNum: this.outboundNumInput * flag }
      let _this = this;
      this.$vux.loading.show({
        text: '请稍等...'
      });
      mobileScanSaveOutboundDetail(para)
        .then((res) => {
          this.$vux.loading.hide();
          _this.editShow = false;
          _this.$vux.toast.text(res.data.msg);
          _this.getDetails(flag);
        })
        .catch((data) => {
          this.$vux.loading.hide();
          util.errorCallBack(data, this.$router);
        });
    },
    toColorDetails(flag) {
      this.orderDetail.forEach((item, index, curArr) => {
        if (item.skuCode === this.currentSkuCode) {
          item['mark'] = flag;
          return;
        }
      })
    },
    onSkuQueryChange(skuQuery) {
      this.skuQuery = skuQuery;
    },
    onClickBack() {
      this.$router.push({ path: "/outboundScanSelect/" });
    },
    getDetails(colorFlag) {
      let _this = this;
      if (
        this.orderNo === undefined ||
        this.orderNo === null ||
        this.orderNo === ""
      ) {
        this.$vux.toast.text("出库单数据出错，请返回重新进入", "buttom");
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
      this.$vux.loading.show({
        text: '请稍等...'
      });
      getOutboundDetailListPage(para)
        .then((res) => {
          this.$vux.loading.hide();
          this.detailTotal = res.data.size;
          this.orderDetail = res.data.list.reverse();
          if (colorFlag !== 0) {
            _this.toColorDetails(colorFlag);
          }
        })
        .catch((data) => {
          this.$vux.loading.hide();
          util.errorCallBack(data, this.$router);
        });
    },
    onSubmit() {
      // 查询产品信息
      alert("查询产品信息");
    },
  },
  created() {
    window.onQrcodeScanResult = this.onQrcodeScanResult;
    this.page = 1;
  },
  mounted() {
    this.currentUserName = localStorage.getItem("userName");
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
      this.getDetails(0);
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
  font-size: 18px;
}

.FONT-ADD {
  font-size: 18px;
  line-height: 28px;
  background-color: #3cc51f;
  color: #fff;
}

.FONT-MINUS {
  font-size: 18px;
  background-color: #ce272d;
  color: #fff;
}
</style>
