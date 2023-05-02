<template>
  <div>
    <div style="height: 44px; z-index: 999">
      <sticky>
        <x-header
          :left-options="{ preventGoBack: true }"
          @on-click-back="onClickBack"
          >出库拣货<a slot="right" @click="scan">扫描</a></x-header
        >
        <search
          @on-change="changeOrderNo"
          v-model="orderNo"
          position="absolute"
          auto-scroll-to-top
          top="46px"
          @on-submit="onSubmit"
          placeholder="输入出库单号"
          ref="search"
        >
        </search>
      </sticky>
    </div>
    <!--<video autoplay class="video" style="height: 400px"></video>-->
    <tab style="margin-top: 46px">
      <tab-item selected @on-item-click="allTabClickHandler">全部</tab-item>
      <tab-item @on-item-click="unPickTabClickHandler">未拣货</tab-item>
      <tab-item @on-item-click="pickTabClickHandler">已拣货</tab-item>
      <tab-item @on-item-click="unAllocClickHandler">缺货</tab-item>
    </tab>
    <div v-transfer-dom>
      <popup v-model="pickUpShow" height="270px" is-transparent>
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
              title="拣货数"
              type="number"
              text-align="right"
              :required="true"
              v-model="pickNumInput"
            ></x-input>
          </group>
          <div style="padding: 20px 15px">
            <x-button type="primary" @click.native="pickUpSumbmit"
              >拣货确认</x-button
            >
            <x-button @click.native="pickUpShow = false">取消</x-button>
          </div>
        </div>
      </popup>
    </div>
    <x-table>
      <thead>
        <tr class="FONT-ORDERHEADER">
          <th>订单号</th>
          <th>客户</th>
        </tr>
      </thead>
      <tbody>
        <tr class="FONT-ORDERHEADER-BODY">
          <td>{{ orderNo }}</td>
          <td>{{ customerName }}</td>
        </tr>
      </tbody>
    </x-table>
    <div v-show="pickViewVisible">
      <x-table>
        <thead>
          <tr class="FONT-HEADER">
            <th style="width: 6%">No</th>
            <th style="width: 14%">产品编码</th>
            <th>产品名称</th>
            <th>车型</th>
            <th>数量</th>
            <th style="width: 14%">库位</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in orderDetailAlloc"
            @click="pickUpOrCancel(item, index)"
            :class="getTrClass(item)"
          >
            <td>{{ item.lineNo }}</td>
            <td>{{ item.skuCode }}</td>
            <td>{{ item.skuName }}</td>
            <td>{{ item.modelCode }}</td>
            <td>{{ item.outboundNum }}</td>
            <td>{{ item.allocLocCode }}</td>
          </tr>
        </tbody>
      </x-table>
    </div>
    <div v-show="unAllocViewVisible">
      <x-table>
        <thead>
          <tr class="FONT-HEADER">
            <th>行号</th>
            <th>产品编码</th>
            <th>产品名称</th>
            <th>车型</th>
            <th>订货数</th>
            <th>缺货数</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in orderDetail"
            @click="selectDetail(item, index)"
            :class="getDetailTrClass(item)"
          >
            <td>{{ item.lineNo }}</td>
            <td>{{ item.skuCode }}</td>
            <td>{{ item.skuName }}</td>
            <td>{{ item.modelCode }}</td>
            <td>{{ item.outboundNum }}</td>
            <td>{{ item.outboundNum - item.outboundAllocNum }}</td>
          </tr>
        </tbody>
      </x-table>
      <popup v-model="showCreateCrossDockPopup">
        <div class="crossDockPopup">
          <group>
            <search
              v-model="supplierQuery"
              position="relative"
              auto-scroll-to-top
              @on-submit="onQuerySupplier"
              placeholder="查询供应商"
              ref="searchSupplier"
            >
            </search>
            <cell @click.native="createCrossDockInboundOrder(item.customerCode)"  v-for="(item, index) in supplierQueryResults" :title="item.customerName" :value="item.customerCode"></cell>
          </group>
        </div>
      </popup>
      <div>
        <x-button type="primary" @click.native="createAssembleOrder"
          >生成临时加工单</x-button
        >
        <x-button type="primary" @click.native="createCrossDockPopup"
          >临时调货</x-button
        >
      </div>
    </div>
    <!--<div>-->
    <!--<grid :rows=3 style="margin-top: 20px">-->
    <!--<grid-item class="cardItem">-->
    <!--<x-input title="" v-model="searchLineNo"></x-input>-->
    <!--</grid-item>-->
    <!--</grid>-->
    <!--</div>-->
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
// import {requestLogin} from '../api/sysApi'
// import {getFittingTypeList} from '../../api/fittingTypeApi'
// import {getFittingSkuListPage} from '../../api/fittingSkuApi'
// import {getFittingModelList} from '../../api/modelApi'
import {
  getOutboundDetailListPage,
  getOutboundAllocListPage,
  pick,
  cancelPick,
  createAssembleByDetails,
  createCrossDockInboundByDetails,
} from "../../api/outboundApi";
import { query } from "../../api/popWinApi";
import { requestAccessToken } from "../../api/sysApi";
import Vue from "vue";
import axios from "axios";
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
      supplierQuery: "",
      supplierQueryResults:[],
      showCreateCrossDockPopup: false,
      searchLineNo: "",
      orderNo: "",
      customerName: "",
      orderDetailAlloc: [],
      page: 1,
      size: 999,
      total: 0,
      pickUpShow: false,
      pickNumInput: 0,
      currentIndex: 0,
      multiStatus: "'40'" + "," + "'60'" + "," + "'65'",
      pickViewVisible: true,
      unAllocViewVisible: false,
      orderDetail: [],
      checkList: [],
      detailMultiStatus: "'00'" + "," + "'30'",
      detailPage: 1,
      detailSize: 999,
      detailTotal: 0,
    };
  },
  methods: {
    onQuerySupplier() {
      let para = {};
      // para['page'] = this.page;
      // para['size'] = this.size;
      para["queryConditions"] = JSON.stringify({
        customerName: this.supplierQuery,
      });
      para["queryType"] = "BdCustomerMapper.selectAllByPage";
      para["sys"] = "wms";
      query(para).then((res) => {
        // this.total = res.data.size;
        this.supplierQueryResults = res.data.list;
      });
    },
    createCrossDockPopup() {
      this.showCreateCrossDockPopup = !this.showCreateCrossDockPopup;
    },
    createCrossDockInboundOrder(supplierCode) {
      let lineNos = "";
      for (let i = 0; i < this.orderDetail.length; i++) {
        if (this.orderDetail[i].selected) {
          lineNos = lineNos + "," + this.orderDetail[i].lineNo;
        }
      }
      if (lineNos.length > 0) {
        let para = {
          supplierCode: supplierCode,
          orderNo: this.orderNo,
          lineNos: lineNos,
        };
        createCrossDockInboundByDetails(para)
          .then((res) => {
            this.$vux.toast.text(res.data.msg, "buttom");
            if (res.data.code === 200 || res.data.code === 100) {
              this.getDetails();
            }
          })
          .catch((data) => {
            util.errorCallBack(data, this.$router);
          });
      }
    },
    createAssembleOrder() {
      let lineNos = "";
      for (let i = 0; i < this.orderDetail.length; i++) {
        if (this.orderDetail[i].selected) {
          lineNos = lineNos + "," + this.orderDetail[i].lineNo;
        }
      }
      if (lineNos.length > 0) {
        let para = { orderNo: this.orderNo, lineNos: lineNos };
        createAssembleByDetails(para)
          .then((res) => {
            this.$vux.toast.text(res.data.msg, "buttom");
            if (res.data.code === 200 || res.data.code === 100) {
              this.getDetails();
            }
          })
          .catch((data) => {
            util.errorCallBack(data, this.$router);
          });
      }
    },
    pickUpOrCancel(item, index) {
      if (item.status === "40") {
        this.pickUpShow = true;
        this.currentIndex = index;
        this.pickNumInput = this.orderDetailAlloc[index].pickNum;
      } else if (item.status === "60" || item.status === "65") {
        this.cancelPickUp(index);
      }
    },
    selectDetail(item, index) {
      let newDetails = Object.assign([], this.orderDetail);
      newDetails[index].selected = !item.selected;
      this.orderDetail = newDetails;
    },
    getTrClass(item) {
      if (item.status === "40") {
        return "FONT";
      } else if (item.status === "60") {
        return "FONT-COMPLETE";
      } else if (item.status === "65") {
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
    allTabClickHandler: function () {
      this.multiStatus = "'40'" + "," + "'60'" + "," + "'65'";
      this.pickViewVisible = true;
      this.unAllocViewVisible = false;
      this.getDetailAllocs();
    },
    unPickTabClickHandler: function () {
      this.multiStatus = "'40'";
      this.pickViewVisible = true;
      this.unAllocViewVisible = false;
      this.getDetailAllocs();
    },
    pickTabClickHandler: function () {
      this.multiStatus = "'60'" + "," + "'65'";
      this.pickViewVisible = true;
      this.unAllocViewVisible = false;
      this.getDetailAllocs();
    },
    unAllocClickHandler: function () {
      this.detailMultiStatus = "'30'" + "," + "'00'" + "," + "'00'";
      this.pickViewVisible = false;
      this.unAllocViewVisible = true;
      this.getDetails();
    },
    btnPickUpStatus: function (index) {
      if (this.orderDetailAlloc[index].status === "40") {
        return false;
      } else if (
        this.orderDetailAlloc[index].status === "60" ||
        this.orderDetailAlloc[index].status === "65"
      ) {
        return true;
      }
    },
    btnCancelPickUpStatus: function (index) {
      if (this.orderDetailAlloc[index].status === "40") {
        return true;
      } else if (
        this.orderDetailAlloc[index].status === "60" ||
        this.orderDetailAlloc[index].status === "65"
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
        this.orderDetailAlloc[index].status
      );
    },
    getDetailAllocs() {
      if (
        this.orderNo === undefined ||
        this.orderNo === null ||
        this.orderNo === ""
      ) {
        this.$vux.toast.text("请输入出库单号进行查询", "buttom");
        return;
      }
      let para = {
        page: this.page,
        size: this.size,
        conditions: JSON.stringify({
          orderNo: this.orderNo,
          multiStatus: this.multiStatus,
          orderByConditions:
            "order by woa.alloc_loc_code,woa.sku_code,woa.line_no+0",
        }),
      };
      getOutboundAllocListPage(para)
        .then((res) => {
          this.total = res.data.size;
          this.orderDetailAlloc = res.data.list;
          if (this.orderDetailAlloc.length > 0) {
            this.customerName = this.orderDetailAlloc[0].buyerName;
          }
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
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
          multiStatus: this.detailMultiStatus,
        }),
      };
      getOutboundDetailListPage(para)
        .then((res) => {
          this.detailTotal = res.data.size;
          this.orderDetail = res.data.list;
          if (res.data.size > 0) {
            for (let i = 0; i < res.data.size; i++) {
              this.orderDetail[i]["selected"] = false;
            }
          }
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
    },
    onSubmit() {
      // 重置页码为第一页
      this.page = 1;
      this.detailPage = 1;
      this.orderDetailAlloc = [];
      this.getDetailAllocs();
      this.getDetails();
    },
    pickUp(index) {
      this.pickUpShow = true;
      this.currentIndex = index;
      this.pickNumInput = this.orderDetailAlloc[index].pickNum;
    },
    pickUpSumbmit() {
      if (
        this.pickNumInput < this.orderDetailAlloc[this.currentIndex].outboundNum
      ) {
        this.$vux.toast.text("只能超量或者等量拣货", "buttom");
        return;
      }
      let para = Object.assign({}, this.orderDetailAlloc[this.currentIndex]);
      pick({ alloc: JSON.stringify(para), pickNum: this.pickNumInput })
        .then((res) => {
          this.$vux.toast.text(res.data.msg, "buttom");
          this.pickUpShow = false;
          if (res.data.code === 200) {
            this.getDetailAllocs();
          }
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
    },
    cancelPickUp(index) {
      let para = Object.assign({}, this.orderDetailAlloc[index]);
      cancelPick({ alloc: JSON.stringify(para) })
        .then((res) => {
          this.$vux.toast.text(res.data.msg, "buttom");
          if (res.data.code === 200) {
            this.getDetailAllocs();
          }
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
    },
    nextPage() {
      let totalPage = Math.ceil(this.total / this.size);
      if (this.page >= 1 && this.page < totalPage) {
        this.page++;
        this.getDetailAllocs();
      } else if (this.page === totalPage) {
        this.$vux.toast.text("已经是最后一页了", "buttom");
      }
    },
    prePage() {
      let totalPage = Math.ceil(this.total / this.size);
      if (this.page > 1 && this.page <= totalPage) {
        this.page--;
        this.getDetailAllocs();
      } else if (this.page === 1) {
        this.$vux.toast.text("已经是第一页了", "buttom");
      }
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
      this.getDetailAllocs();
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
.crossDockPopup {
  height: 500px;
}
</style>
