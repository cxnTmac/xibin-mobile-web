<template>
  <div>
    <div style="height: 44px; z-index: 999">
      <sticky>
        <x-header
          :left-options="{ preventGoBack: true }"
          @on-click-back="onClickBack"
          >入库收货<a slot="right" @click="scan">扫描</a></x-header
        >
        <search
          @on-change="changeOrderNo"
          v-model="orderNo"
          position="absolute"
          auto-scroll-to-top
          top="46px"
          @on-submit="onSubmit"
          placeholder="输入入库单号"
          ref="search"
        >
        </search>
      </sticky>
    </div>
    <!--<video autoplay class="video" style="height: 400px"></video>-->
    <tab style="margin-top: 46px">
      <tab-item selected @on-item-click="detailTabClickHandler">明细</tab-item>
      <tab-item @on-item-click="receiveTabClickHandler">收货明细</tab-item>
    </tab>
    <div v-transfer-dom>
      <popup v-model="receiveShow" height="270px" is-transparent>
        <div
          style="
            width: 95%;
            background-color: #fff;
            height: 250px;
            margin: 0 auto;
            border-radius: 5px;
            padding-top: 10px;
          "
        >
          <group>
            <x-input
              title="预收数"
              type="number"
              text-align="right"
              :disabled="true"
              v-model="preReceiveNumInput"
            ></x-input>
            <x-input
              title="实收数"
              type="number"
              text-align="right"
              :required="true"
              v-model="receiveNumInput"
            ></x-input>
          </group>
          <div style="padding: 20px 15px">
            <x-button type="primary" @click.native="receiveSumbmit"
              >收货确认</x-button
            >
            <x-button @click.native="receiveShow = false">取消</x-button>
          </div>
        </div>
      </popup>
    </div>
    <x-table>
      <thead>
        <tr class="FONT-ORDERHEADER">
          <th>订单号</th>
          <th>供应商</th>
        </tr>
      </thead>
      <tbody>
        <tr class="FONT-ORDERHEADER-BODY">
          <td>{{ orderNo }}</td>
          <td>{{ supplierName }}</td>
        </tr>
      </tbody>
    </x-table>
    <div v-show="detailViewVisible">
      <x-table>
        <thead>
          <tr class="FONT-HEADER">
            <th style="width: 6%">No</th>
            <th style="width: 14%">产品编码</th>
            <th>产品名称</th>
            <th>车型</th>
            <th>预收数</th>
            <th>实收数</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in orderDetail"
            :class="getTrClass(item)"
          >
            <td>{{ item.lineNo }}</td>
            <td>{{ item.skuCode }}</td>
            <td>{{ item.fittingSkuName }}</td>
            <td>{{ item.modelCode }}</td>
            <td>{{ item.inboundPreNum }}</td>
            <td>{{ item.inboundNum }}</td>
          </tr>
        </tbody>
      </x-table>
    </div>
    <div v-show="receiveViewVisible">
      <x-table>
        <thead>
          <tr class="FONT-HEADER">
            <th>行号</th>
            <th>产品编码</th>
            <th>产品名称</th>
            <th>车型</th>
            <th>预收数</th>
            <th>收货数</th>
            <th>库位</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in orderDetailReceive"
            @click="receiveOrCancel(item, index)"
            :class="getTrClass(item)"
          >
            <td>{{ item.lineNo }}</td>
            <td>{{ item.skuCode }}</td>
            <td>{{ item.fittingSkuName }}</td>
            <td>{{ item.modelCode }}</td>
            <td>{{ item.inboundPreNum }}</td>
            <td>{{ item.inboundNum }}</td>
            <td>{{ item.inboundLocCode}}</td>
          </tr>
        </tbody>
      </x-table>
    </div>
  </div>
</template>

<script>
import wx from "weixin-js-sdk";
import {
  CheckIcon,
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
import {
  getInboundDetailListPage,
  getInboundRecListPage,
  cancelReceive,
  receive
} from "../../api/inboundApi";
import { requestAccessToken } from "../../api/sysApi";
import Vue from "vue";
import util from "../../../common/js/util";
var codemaster = require("../../../static/codemaster.json");
Vue.use(AlertPlugin);
Vue.use(LoadingPlugin);
Vue.use(ToastPlugin);
export default {
  directives: {
    TransferDom,
  },
  components: {
    CheckIcon,
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
      orderNo: "",
      supplierName: "",
      orderDetail: [],
      page: 1,
      size: 999,
      total: 0,
      receiveShow: false,
      preReceiveNumInput: 0,
      receiveNumInput: 0,
      currentIndex: 0,
      detailViewVisible: true,
      receiveViewVisible: false,
      orderDetailReceive: [],
      detailReceivePage: 1,
      detailReceiveSize: 999,
      detailReceiveTotal: 0,
    };
  },
  methods: {
    receiveOrCancel(item, index) {
      if (item.status === "00") {
        this.receiveShow = true;
        this.currentIndex = index;
        this.preReceiveNumInput = this.orderDetailReceive[index].inboundPreNum;
        this.receiveNumInput = this.orderDetailReceive[index].inboundNum;
      } else if (item.status === "20") {
        this.cancelReceive(index);
      }
    },
    selectDetail(item, index) {
      let newDetails = Object.assign([], this.orderDetail);
      newDetails[index].selected = !item.selected;
      this.orderDetail = newDetails;
    },
    getTrClass(item) {
      if (item.status === "00") {
        return "FONT";
      } else if (item.status === "20") {
        return "FONT-COMPLETE";
      } else if (item.status === "10") {
        return "FONT-OVERCOMPLETE";
      }
    },
    getDetailTrClass(item) {
      if (item.selected === true) {
        return "FONT-SELECTED";
      }
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
    detailTabClickHandler: function () {
      this.detailViewVisible = true;
      this.receiveViewVisible = false;
      this.getDetail();
    },
    receiveTabClickHandler: function () {
      this.detailViewVisible = false;
      this.receiveViewVisible = true;
      this.getDetailReceive();
    },
    btnPickUpStatus: function (index) {
      if (this.orderDetail[index].status === "40") {
        return false;
      } else if (
        this.orderDetail[index].status === "60" ||
        this.orderDetail[index].status === "65"
      ) {
        return true;
      }
    },
    btnCancelPickUpStatus: function (index) {
      if (this.orderDetail[index].status === "40") {
        return true;
      } else if (
        this.orderDetail[index].status === "60" ||
        this.orderDetail[index].status === "65"
      ) {
        return false;
      }
    },
    onClickBack() {
      this.$router.push({ path: "/menu/" });
    },
    getStatus: function (index) {
      return util.getComboNameByValue(
        codemaster.WM_OUTBOUND_STATUS,
        this.orderDetail[index].status
      );
    },
    getDetail() {
      if (
        this.orderNo === undefined ||
        this.orderNo === null ||
        this.orderNo === ""
      ) {
        this.$vux.toast.text("请输入入库单号进行查询", "buttom");
        return;
      }
      let para = {
        page: this.page,
        size: this.size,
        conditions: JSON.stringify({
          orderNo: this.orderNo,
          orderByConditions:
            "order by woa.alloc_loc_code,woa.sku_code,woa.line_no+0",
        }),
      };
      getInboundDetailListPage(para)
        .then((res) => {
          this.total = res.data.size;
          this.orderDetail = res.data.list;
          if (this.orderDetail.length > 0) {
            this.supplierName = this.orderDetail[0].supplierName;
          }
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
    },
    getDetailReceive() {
      if (
        this.orderNo === undefined ||
        this.orderNo === null ||
        this.orderNo === ""
      ) {
        this.$vux.toast.text("请输入入库单号进行查询", "buttom");
        return;
      }
      let para = {
        page: this.detailReceivePage,
        size: this.detailReceiveSize,
        conditions: JSON.stringify({
          orderNo: this.orderNo,
          orderByConditions:
            "order by woa.alloc_loc_code,woa.sku_code,woa.line_no+0",
        }),
      };
      getInboundRecListPage(para)
        .then((res) => {
          this.detailReceiveTotal = res.data.size;
          this.orderDetailReceive = res.data.list;
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
      this.getDetail();
      this.getDetailReceive();
    },
    receiveSumbmit() {
      if (
        this.receiveNumInput > this.preReceiveNumInput
      ) {
        this.$vux.toast.text("收货数不能大于预收数", "buttom");
        return;
      }
      let para = Object.assign({}, this.orderDetailReceive[this.currentIndex]);
      para.inboundNum = this.receiveNumInput;
      receive({ receive: JSON.stringify(para) })
        .then((res) => {
          this.$vux.toast.text(res.data.msg, "buttom");
          this.receiveShow = false;
          if (res.data.code === 200) {
            this.getDetail();
          }
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
    },
    cancelReceive(index) {
      let para = Object.assign({}, this.orderDetailReceive[index]);
      cancelReceive({ receive: JSON.stringify(para) })
        .then((res) => {
          this.$vux.toast.text(res.data.msg, "buttom");
          if (res.data.code === 200) {
            this.getDetail();
            this.getDetailReceive();
          }
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
    },
  },
  created() {
    window.onQrcodeScanResult = this.onQrcodeScanResult;
    this.page = 1;
  },
  mounted() {
    this.orderNo = this.$route.query.orderNo;
    if (
      this.orderNo === undefined ||
      this.orderNo === null ||
      this.orderNo === ""
    ) {
      this.$vux.toast.text("请输入出库单号进行查询", "buttom");
    } else {
      this.getDetail();
      this.getDetailReceive();
    }
    console.log(
      "URL： " + encodeURIComponent(window.location.href.split("#")[0])
    );
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
  font-size: 12px;
}
.FONT {
  font-size: 14px;
  line-height: 28px;
}
.FONT-COMPLETE {
  font-size: 14px;
  line-height: 28px;
  background-color: #3cc51f;
  color: #fff;
}
.FONT-OVERCOMPLETE {
  font-size: 14px;
  line-height: 28px;
  background-color: #ffbe00;
  color: #fff;
}
.FONT-COMPLETE :active {
  background-color: #ce272d;
  color: #fff;
}
.FONT-OVERCOMPLETE :active {
  background-color: #ce272d;
  color: #fff;
}
.FONT-SELECTED {
  background-color: #003057;
  color: #fff;
}
</style>
