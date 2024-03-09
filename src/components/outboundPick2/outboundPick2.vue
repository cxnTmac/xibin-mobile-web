<template>
  <div>
    <div style="height: 44px; z-index: 999">
      <sticky>
        <x-header :left-options="{ preventGoBack: true }" @on-click-back="onClickBack">出库拣货<a slot="right"
            @click="scan">扫描</a></x-header>
        <search @on-change="changeOrderNo" v-model="orderNo" position="absolute" auto-scroll-to-top top="46px"
          @on-submit="onSubmit" placeholder="输入出库单号" ref="search">
        </search>
      </sticky>
    </div>
    <!--<video autoplay class="video" style="height: 400px"></video>-->
    <tab style="margin-top: 46px">
      <tab-item selected @on-item-click="allTabClickHandler">全部</tab-item>
      <tab-item @on-item-click="unPickTabClickHandler">未拣货</tab-item>
      <tab-item @on-item-click="pickTabClickHandler">已拣货</tab-item>
      <tab-item @on-item-click="unPackedTabClickHandler">打包</tab-item>
      <tab-item @on-item-click="unAllocClickHandler">缺货<badge v-if="orderDetail.length > 0"
          style="margin-bottom: 10px;margin-left: 5px;" :text="orderDetail.length"></badge></tab-item>
    </tab>
    <div v-transfer-dom>
      <popup v-model="changeAllocShow" height="330px" is-transparent>
        <div style="
            width: 95%;
            background-color: #fff;
            height: 320px;
            margin: 0 auto;
            border-radius: 5px;
            padding-top: 10px;
          ">
          <group>
            <cell title="产品编码：">{{ changeAllocCurrentSkuCode }}</cell>
            <cell title="产品名称：">{{ changeAllocCurrentSkuName }}</cell>
            <cell title="车型：">{{ changeAllocCurrentModelCode }}</cell>
            <cell title="当前库位：">{{ changeAllocCurrentLoc }}</cell>
            <x-input title="更正库位：" text-align="right" v-model="newLoc"></x-input>
          </group>
          <div style="padding: 20px 15px">
            <x-button type="primary" @click.native="changeAllocSubmit">更正库位</x-button>
          </div>
        </div>
      </popup>
    </div>
    <div v-transfer-dom>
      <popup v-model="pickUpShow" height="430px" is-transparent>
        <div style="
            width: 95%;
            background-color: #fff;
            height: 420px;
            margin: 0 auto;
            border-radius: 5px;
            padding-top: 10px;
          ">

          <div v-if="showGenericSkuInfo" style="margin-left: 3%;">
            <flexbox>
              <flexbox-item :span="3"><x-button mini type="warn">{{ genericSkuCode }}</x-button></flexbox-item>
              <flexbox-item>
                <div>{{ genericSkuName }}</div>
                <div>{{ genericSkuModelCode }}</div>
              </flexbox-item>
            </flexbox>
          </div>
          <div v-if="!showGenericSkuInfo" style="margin-left: 3%;">
            <flexbox><flexbox-item :span="3">
                <div>{{ currentSkuCode }}</div>
              </flexbox-item>
              <flexbox-item>
                <div>{{ currentSkuName }}</div>
                <div>{{ currentModelCode }}</div>
              </flexbox-item>
            </flexbox>
          </div>
        <group>
          <!--:max="orderDetailAlloc[currentIndex].outboundNum"  -->
          <x-number title="拣货数:" :min="0.5" :step="0.5" v-model="pickNumInput" fillable></x-number>
          <x-number title="件数:" :min="1" v-model="packageNumInput" fillable></x-number>
        </group>
        <div style="padding: 20px 15px">
          <x-button type="primary" @click.native="pickUpSumbmit">整件拣货</x-button>
          <x-button type="primary" @click.native="unpackedPickUpSumbmit">散件拣货</x-button>
          <x-button type="primary" @click.native="cancelAllocSubmit">取消分配</x-button>
          <x-button @click.native="pickUpShow = false">取消</x-button>
        </div>
    </div>
    </popup>
  </div>
  <div v-transfer-dom>
    <confirm v-model="deleteConfirmShow" title="删除明细" @on-cancel="deleteDetailCancel" @on-confirm="deleteDetailConfirm">
      <p style="text-align:center;">确定删除吗？</p>
    </confirm>
  </div>
  <div v-transfer-dom>
    <popup v-model="detailShow" height="390px" is-transparent>
      <div style="
            width: 95%;
            background-color: #fff;
            height: 380px;
            margin: 0 auto;
            border-radius: 5px;
            padding-top: 10px;
          ">
        <group>
          <x-number title="订货数:" :min="0.5" :step="0.5" v-model="outboundNumInput" fillable></x-number>
        </group>
        <div style="padding: 20px 15px">
          <x-button type="primary" @click.native="changeOutboundNum">修改数量并重新分配</x-button>
          <x-button type="primary" @click.native="cancelAllocSubmitByDetail">取消分配</x-button>
          <x-button type="primary" @click.native="virtualAllocSubmit">虚拟分配</x-button>
          <x-button type="warn" @click.native="deleteDetail">删除</x-button>
          <x-button @click.native="detailShow = false">取消</x-button>
        </div>
      </div>
    </popup>
  </div>

  <x-table>
    <thead>
      <tr class="FONT-ORDERHEADER">
        <th>订单号</th>
        <th>客户</th>
        <th>总件数</th>
      </tr>
    </thead>
    <tbody>
      <tr class="FONT-ORDERHEADER-BODY">
        <td>{{ orderNo }}</td>
        <td>{{ customerName }}</td>
        <td>{{ totalPackageNum }}</td>
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
        <tr v-left-swipe="{ method: rightSwipe, para: item }" v-for="(item, index) in orderDetailAlloc"
          @click="pickUpOrCancel(item, index)" :class="getTrClass(item)" :id="item.skuCode">
          <td>{{ item.lineNo }}</td>
          <td>{{ item.skuCode + "\n" + (item.remark === null ? '' : "(" + item.remark + ")") }}
            <x-button v-if="item.genericSkuCode !== null" mini type="warn">{{ item.genericSkuCode }}</x-button>
          </td>
          <td>{{ item.skuName }}</td>
          <td>{{ item.modelCode }}</td>
          <td>{{ getOutboundNum(item) }}</td>
          <td>{{ item.allocLocCode }}</td>
        </tr>
      </tbody>
    </x-table>
  </div>
  <div v-show="packViewVisible">
    <flexbox>
      <flexbox-item :span="3">
        <h1 class="currentPackageNo">{{ "箱:" + this.packageNoInput }}</h1>
      </flexbox-item>
      <flexbox-item :span="6">
        <x-number mini :min=1 v-model="packageNoInput"></x-number>
      </flexbox-item>
      <flexbox-item><x-button mini type="primary" @click.native="newBox">新箱子</x-button></flexbox-item>
    </flexbox>
    <x-table>
      <thead>
        <tr class="FONT-HEADER">
          <th>箱号</th>
          <th style="width: 14%">产品编码</th>
          <th>产品名称</th>
          <th>车型</th>
          <th>数量</th>
          <th style="width: 6%">No</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in orderDetailAllocPack" @click="packOrCancel(item, index)"
          :class="getPackTrClass(item)">
          <td>{{ item.packageNo }}</td>
          <td>{{ item.skuCode }}</td>
          <td>{{ item.skuName }}</td>
          <td>{{ item.modelCode }}</td>
          <td>{{ item.outboundNum }}</td>
          <td>{{ item.lineNo }}</td>
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
        <tr v-for="(item, index) in orderDetail" @click="selectDetail2(item, index)" :class="getDetailTrClass(item)">
          <td>{{ item.lineNo }}</td>
          <td>{{ item.skuCode }}</td>
          <td>{{ item.skuName }}</td>
          <td>{{ item.modelCode }}</td>
          <td>{{ item.outboundNum }}</td>
          <td>{{ item.outboundNum - item.outboundAllocNum }}</td>
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
  Badge,
  Flexbox,
  FlexboxItem,
  Confirm
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
  cancelAlloc,
  saveOutboundDetail,
  alloc,
  virtualAlloc,
  pack,
  cancelPack,
  getTotalPackageNumByOrderNo,
  selectForMobileAlloc,
  removeOutboundDetail
} from "../../api/outboundApi";
import { changeLocByAlloc } from "../../api/inventoryApi";
import { query } from "../../api/popWinApi";
import { requestAccessToken } from "../../api/sysApi";
import { getSkuBySkuCode } from "../../api/fittingSkuApi";
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
    XNumber,
    CheckIcon,
    XTable,
    Tab,
    TabItem,
    Popup,
    FormPreview,
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
    Badge,
    Flexbox,
    FlexboxItem,
    Confirm
  },
  data() {
    return {
      orderNo: "",
      customerName: "",
      orderDetailAlloc: [],
      orderDetailAllocPack: [],
      page: 1,
      size: 999,
      total: 0,
      detailShow: false,
      outboundNumInput: 0,
      detailCurrentIndex: 0,
      pickUpShow: false,
      pickNumInput: 0,
      packageNumInput: 0,
      currentIndex: 0,
      multiStatus: "'40'" + "," + "'60'" + "," + "'65'",
      pickViewVisible: true,
      packViewVisible: false,
      unAllocViewVisible: false,
      orderDetail: [],
      checkList: [],
      detailMultiStatus: "'00'" + "," + "'30'",
      detailPage: 1,
      detailSize: 999,
      detailTotal: 0,
      packageNoInput: 1,
      totalPackageNum: 0,
      newLoc: "",
      changeAllocCurrentSkuCode: "",
      changeAllocCurrentSkuName: "",
      changeAllocCurrentLoc: "",
      changeAllocCurrentModelCode: "",
      changeAllocShow: false,
      currentSkuCode: '',
      currentSkuName: '',
      currentModelCode: '',
      showGenericSkuInfo: false,
      genericSkuCode: '',
      genericSkuName: '',
      genericSkuModelCode: '',
      deleteConfirmShow: false
    };
  },
  methods: {
    rightSwipe(para) {
      if (para.allocType === "VIRTUAL") {
        this.$vux.toast.text("虚拟分配库位不能更正库位", "buttom");
        return;
      }
      this.changeAllocCurrentSkuCode = para.skuCode;
      this.changeAllocCurrentSkuName = para.skuName;
      this.changeAllocCurrentLoc = para.allocLocCode;
      this.changeAllocCurrentModelCode = para.modelCode;
      this.newLoc = "";
      this.changeAllocShow = true;
    },
    newBox() {
      let maxPackgeNo = 0;
      this.orderDetailAllocPack.forEach(function (value, index, array) {
        if (value.packageNo > maxPackgeNo) {
          maxPackgeNo = value.packageNo
        }
      });
      this.packageNoInput = maxPackgeNo + 1;
    },
    getOutboundNum(item) {
      if (item.totalOutboundNum === item.outboundNum) {
        return item.outboundNum;
      } else {
        return item.outboundNum + "/" + item.totalOutboundNum;
      }
    },
    packOrCancel(item, index) {
      let para = Object.assign({}, item);
      let _this = this;
      if (item.packageNo === -1) {
        para.packageNo = this.packageNoInput;
        _this.$vux.loading.show({
          text: '请稍等...'
        });
        pack({ alloc: JSON.stringify(para) }).then((res) => {
          _this.$vux.loading.hide();
          _this.$vux.toast.text(res.data.msg, "buttom");
          if (res.data.code === 200) {
            _this.getUnpackedDetailAllocs();
            _this.getTotalPackageNum();
          }
        });
      } else if (item.status >= 1) {
        _this.$vux.loading.show({
          text: '请稍等...'
        });
        cancelPack({ alloc: JSON.stringify(para) }).then((res) => {
          _this.$vux.loading.hide();
          _this.$vux.toast.text(res.data.msg, "buttom");
          if (res.data.code === 200) {
            _this.getUnpackedDetailAllocs();
            _this.getTotalPackageNum();
          }
        });
      }
    },
    pickUpOrCancel(item, index) {
      if (item.status === "40") {
        this.pickUpShow = true;
        this.currentIndex = index;
        this.pickNumInput = this.orderDetailAlloc[index].pickNum;
        if (item.genericSkuCode !== undefined && item.genericSkuCode !== null && item.genericSkuCode !== '') {
          this.showGenericSkuInfo = true;
          this.genericSkuCode = item.genericSkuCode;
          getSkuBySkuCode({ skuCode: item.genericSkuCode })
            .then((res) => {
              if (res.data !== null) {
                this.genericSkuName = res.data.fittingSkuName;
                this.genericSkuModelCode = res.data.modelCode;
              }
            })
            .catch((data) => {
              util.errorCallBack(data, this.$router);
            });

        } else {
          this.currentSkuCode = item.skuCode;
          this.currentSkuName = item.skuName;
          this.currentModelCode = item.modelCode;
        }
      } else if (item.status === "60" || item.status === "65") {
        this.showGenericSkuInfo = false;
        this.cancelPickUp(index);
      }
    },
    selectDetail2(item, index) {
      this.detailShow = true;
      this.detailCurrentIndex = index;
      this.outboundNumInput = this.orderDetail[index].outboundNum;
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
      } else if (item['selected'] === true) {
        return "FONT-OVERCOMPLETE";
      }
    },
    getPackTrClass(item) {
      if (item.packageNo >= 1) {
        if (item.packageNo % 2 == 0) {
          return "FONT-SINGLEPACKNO";
        } else {
          return "FONT-DOUBLEPACKNO";
        }
      } else {
        return "FONT";
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
      } else {
        var _this = this;
        wx.scanQRCode({
          needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
          success: function (res) {
            _this.onQrcodeScanResult(res.resultStr);
          },
        });
      }
    },
    onQrcodeScanResult(scanResult) {
      let params = this.getUrlParams(scanResult);
      const idTarget = document.getElementById(params.skuCode);
      if (idTarget !== undefined && idTarget !== null) {
        let item = null;
        let index = 0;
        idTarget.scrollIntoView();
        for (let i = 0; i < this.orderDetailAlloc.length; i++) {
          if (this.orderDetailAlloc[i].skuCode === params.skuCode) {
            item = this.orderDetailAlloc[i]
            index = i;
            break;
          };
        };
        if (item.status === "40") {
          item['selected'] = true;
          this.pickUpShow = true;
          this.currentIndex = index;
          this.pickNumInput = item.pickNum;
          if (item.genericSkuCode !== undefined && item.genericSkuCode !== null && item.genericSkuCode !== '') {
            this.showGenericSkuInfo = true;
            this.genericSkuCode = item.genericSkuCode;
            getSkuBySkuCode({ skuCode: item.genericSkuCode })
              .then((res) => {
                if (res.data !== null) {
                  this.genericSkuName = res.data.fittingSkuName;
                  this.genericSkuModelCode = res.data.modelCode;
                }
              })
              .catch((data) => {
                util.errorCallBack(data, this.$router);
              });

          } else {
            this.currentSkuCode = item.skuCode;
            this.currentSkuName = item.skuName;
            this.currentModelCode = item.modelCode;
          }
        }
      }
    },
    changeOrderNo(orderNo) {
      this.orderNo = orderNo;
    },
    allTabClickHandler: function () {
      this.multiStatus = "'40'" + "," + "'60'" + "," + "'65'";
      this.pickViewVisible = true;
      this.packViewVisible = false;
      this.unAllocViewVisible = false;
      this.getDetailAllocs();
    },
    unPickTabClickHandler: function () {
      this.multiStatus = "'40'";
      this.pickViewVisible = true;
      this.packViewVisible = false;
      this.unAllocViewVisible = false;
      this.getDetailAllocs();
    },
    pickTabClickHandler: function () {
      this.multiStatus = "'60'" + "," + "'65'";
      this.pickViewVisible = true;
      this.packViewVisible = false;
      this.unAllocViewVisible = false;
      this.getDetailAllocs();
    },
    unPackedTabClickHandler: function () {
      this.multiStatus = "'60'";
      this.pickViewVisible = false;
      this.packViewVisible = true;
      this.unAllocViewVisible = false;
      this.getUnpackedDetailAllocs();
    },
    unAllocClickHandler: function () {
      this.detailMultiStatus = "'30'" + "," + "'00'" + "," + "'00'";
      this.pickViewVisible = false;
      this.packViewVisible = false;
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
      this.$router.push({ path: "/outboundPickSelect/" });
    },
    getStatus: function (index) {
      return util.getComboNameByValue(
        codemaster.WM_OUTBOUND_STATUS,
        this.orderDetailAlloc[index].status
      );
    },
    getUnpackedDetailAllocs() {
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
          needPacking: 1,
          orderByConditions:
            "order by woa.package_no,woa.sku_code,woa.line_no+0",
        }),
      };
      this.$vux.loading.show({
        text: '请稍等...'
      });
      getOutboundAllocListPage(para)
        .then((res) => {
          this.$vux.loading.hide();
          this.total = res.data.size;
          this.orderDetailAllocPack = res.data.list;
          if (this.orderDetailAllocPack.length > 0) {
            this.customerName = this.orderDetailAllocPack[0].buyerName;
          }
        })
        .catch((data) => {
          this.$vux.loading.hide();
          util.errorCallBack(data, this.$router);
        });
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
        }),
      };
      this.$vux.loading.show({
        text: '请稍等...'
      });
      selectForMobileAlloc(para)
        .then((res) => {
          this.$vux.loading.hide();
          this.orderDetailAlloc = res.data;
          if (this.orderDetailAlloc.length > 0) {
            this.customerName = this.orderDetailAlloc[0].buyerName;
          }
        })
        .catch((data) => {
          this.$vux.loading.hide();
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
      this.$vux.loading.show({
        text: '请稍等...'
      });
      getOutboundDetailListPage(para)
        .then((res) => {
          this.$vux.loading.hide();
          this.detailTotal = res.data.size;
          this.orderDetail = res.data.list;
          if (res.data.size > 0) {
            for (let i = 0; i < res.data.size; i++) {
              this.orderDetail[i]["selected"] = false;
            }
          }
        })
        .catch((data) => {
          this.$vux.loading.hide();
          util.errorCallBack(data, this.$router);
        });
    },
    onSubmit() {
      // 重置页码为第一页
      this.page = 1;
      this.detailPage = 1;
      this.orderDetailAlloc = [];
      this.orderDetail = [];
      this.orderDetailAllocPack = [];
      this.getDetailAllocs();
      this.getUnpackedDetailAllocs();
      this.getDetails();
      this.getTotalPackageNum();
    },
    pickUp(index) {
      this.pickUpShow = true;
      this.currentIndex = index;
      this.pickNumInput = this.orderDetailAlloc[index].pickNum;
    },
    changeAllocSubmit() {
      let _this = this;
      let para = {
        skuCode: this.changeAllocCurrentSkuCode,
        targetLocCode: this.newLoc,
      };
      _this.$vux.loading.show({
        text: '请稍等...'
      });
      changeLocByAlloc(para)
        .then((res) => {
          _this.$vux.loading.hide();
          _this.$vux.toast.text(res.data.msg, "buttom");
          _this.changeAllocShow = false;
          _this.getDetailAllocs();
          _this.getTotalPackageNum();
        })
        .catch((data) => {
          _this.$vux.loading.hide();
          _this.changeAllocShow = false;
          util.errorCallBack(data, _this.$router);
        });
    },
    virtualAllocSubmit() {
      let _this = this;
      let para = {
        orderNo: this.orderDetail[this.detailCurrentIndex].orderNo,
        lineNo: this.orderDetail[this.detailCurrentIndex].lineNo,
        type: "VIRTUAL",
      };
      this.$vux.loading.show({
        text: '请稍等...'
      });
      virtualAlloc(para)
        .then((res) => {
          this.$vux.loading.hide();
          _this.$vux.toast.text(res.data.msg, "buttom");
          _this.getDetails();
        })
        .catch((data) => {
          this.$vux.loading.hide();
          util.errorCallBack(data, _this.$router);
        });
    },
    cancelAllocSubmit() {
      //NProgress.start();
      let _this = this;
      let para = {
        orderNo: this.orderDetailAlloc[this.currentIndex].orderNo,
        lineNos: [this.orderDetailAlloc[this.currentIndex].lineNo].join(","),
      };
      this.$vux.loading.show({
        text: '请稍等...'
      });
      cancelAlloc(para)
        .then((res) => {
          //NProgress.done();
          this.$vux.loading.hide();
          _this.$vux.toast.text(res.data.msg, "buttom");
          _this.pickUpShow = false;
          if (res.data.code === 200) {
            _this.getDetailAllocs();
          }
        })
        .catch((data) => {
          this.$vux.loading.hide();
          util.errorCallBack(data, _this.$router);
        });
    },
    deleteDetailCancel() {
      this.$vux.toast.text("取消删除！");
    },
    deleteDetailConfirm() {
      let _this = this;
      let ids = [this.orderDetail[this.detailCurrentIndex].id].join(",");
      let orderNo = this.orderDetail[this.detailCurrentIndex].orderNo;
      //NProgress.start();
      let para = { ids: ids, orderNo: orderNo };
      this.$vux.loading.show({
        text: '请稍等...'
      });
      removeOutboundDetail(para)
        .then((res) => {
          this.$vux.loading.hide();
          if (res.data.code == 200) {
            _this.$vux.toast.text("操作成功!");
            _this.detailShow = false;
          } else {
            _this.$vux.toast.text(res.data.msg);
          }
          _this.getDetails();
        })
        .catch((data) => {
          this.$vux.loading.hide();
          util.errorCallBack(data, _this.$router);
        });

    },
    deleteDetail() {
      this.deleteConfirmShow = true;

    },
    changeOutboundNum() {
      let _this = this;
      let newDetail = this.orderDetail[this.detailCurrentIndex];
      newDetail.outboundNum = this.outboundNumInput;
      let para = Object.assign({}, newDetail);
      saveOutboundDetail({ detail: JSON.stringify(para) })
        .then((res) => {
          _this.detailShow = false;
          if (res.data.code === 200) {
            let para = {
              orderNo: newDetail.orderNo,
              lineNos: [newDetail.lineNo].join(","),
              type: "AUTO",
            };
            alloc(para)
              .then((res) => {
                _this.$vux.toast.text(res.data.msg, "buttom");
                _this.getDetails();
              })
              .catch((data) => {
                util.errorCallBack(data, _this.$router);
              });
          } else {
            _this.$vux.toast.text(res.data.msg, "buttom");
          }
        })
        .catch((data) => {
          util.errorCallBack(data, _this.$router);
        });
    },
    cancelAllocSubmitByDetail() {
      //NProgress.start();
      let _this = this;
      if (
        this.orderDetail[this.detailCurrentIndex].status !== "30" &&
        this.orderDetail[this.detailCurrentIndex].status !== "40"
      ) {
        this.$vux.toast.text("不是部分分配或者完全分配不可以取消！", "buttom");
        return;
      }
      let para = {
        orderNo: this.orderDetail[this.detailCurrentIndex].orderNo,
        lineNos: [this.orderDetail[this.detailCurrentIndex].lineNo].join(","),
      };
      this.$vux.loading.show({
        text: '请稍等...'
      });
      cancelAlloc(para)
        .then((res) => {
          //NProgress.done();
          _this.$vux.loading.hide();
          _this.$vux.toast.text(res.data.msg, "buttom");
          _this.pickUpShow = false;
          if (res.data.code === 200) {
            _this.getDetails();
          }
        })
        .catch((data) => {
          _this.$vux.loading.hide();
          util.errorCallBack(data, _this.$router);
        });
    },
    unpackedPickUpSumbmit() {
      if (
        this.pickNumInput > this.orderDetailAlloc[this.currentIndex].outboundNum
      ) {
        this.$vux.toast.text("AUTO,需要修改数量请重新分配！", "buttom");
        return;
      }
      this.$vux.loading.show({
        text: '请稍等...'
      });
      let para = Object.assign({}, this.orderDetailAlloc[this.currentIndex]);
      pick({
        alloc: JSON.stringify(para),
        pickNum: this.pickNumInput,
        isPackedSku: "false",
      })
        .then((res) => {
          this.$vux.loading.hide();
          this.$vux.toast.text(res.data.msg, "buttom");
          this.pickUpShow = false;
          if (res.data.code === 200) {
            this.getDetailAllocs();
            this.getTotalPackageNum();
          }
        })
        .catch((data) => {
          this.$vux.loading.hide();
          util.errorCallBack(data, this.$router);
        });
    },
    pickUpSumbmit() {
      if (
        this.pickNumInput > this.orderDetailAlloc[this.currentIndex].outboundNum
      ) {
        this.$vux.toast.text("不能超量拣货,需要修改数量请重新分配！", "buttom");
        return;
      }
      if (this.packageNumInput < 1) {
        this.$vux.toast.text("整件拿货件数必须>=1", "buttom");
        return;
      }
      this.$vux.loading.show({
        text: '请稍等...'
      });
      let para = Object.assign({}, this.orderDetailAlloc[this.currentIndex]);
      pick({
        alloc: JSON.stringify(para),
        pickNum: this.pickNumInput,
        isPackedSku: "true",
        packageNum: this.packageNumInput,
      })
        .then((res) => {
          this.$vux.loading.hide();
          this.$vux.toast.text(res.data.msg, "buttom");
          this.pickUpShow = false;
          if (res.data.code === 200) {
            this.getDetailAllocs();
            this.getTotalPackageNum();
          }
        })
        .catch((data) => {
          this.$vux.loading.hide();
          util.errorCallBack(data, this.$router);
        });
    },
    cancelPickUp(index) {
      let para = Object.assign({}, this.orderDetailAlloc[index]);
      this.$vux.loading.show({
        text: '请稍等...'
      });
      cancelPick({ alloc: JSON.stringify(para) })
        .then((res) => {
          this.$vux.loading.hide();
          this.$vux.toast.text(res.data.msg, "buttom");
          if (res.data.code === 200) {
            this.getDetailAllocs();
            this.getTotalPackageNum();
          }
        })
        .catch((data) => {
          this.$vux.loading.hide();
          util.errorCallBack(data, this.$router);
        });
    },
    getTotalPackageNum() {
      let para = { orderNo: this.orderNo };
      getTotalPackageNumByOrderNo(para)
        .then((res) => {
          this.totalPackageNum = res.data.data;
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router, this.$message);
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
      this.getDetailAllocs();
      this.getTotalPackageNum();
      this.getDetails();
    }
    console.log(
      "URL： " + encodeURIComponent(window.location.href.split("#")[0])
    );
    requestAccessToken({
      url: encodeURIComponent(window.location.href.split("#")[0]),
    })
      .then((res) => {
        if (res.code == 200) {
          wx.config({
            // debug: true, // 开启调试模式,
            appId: res.data.appId, // 必填，企业号的唯一标识，此处填写企业号corpid
            timestamp: res.data.timestamp, // 必填，生成签名的时间戳
            nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
            signature: res.data.signature, // 必填，签名，见附录1
            jsApiList: ["scanQRCode"], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
          });
          // this.$vux.toast.text("服务端jsApiTicket请求成功");
        } else {
          this.$vux.toast.text(
            "服务端jsApiTicket请求失败，无法使用扫描功能，请联系管理员！"
          );
        }
      })
      .catch((data) => {
        console.log(data);
      });
    wx.ready(function () {
      this.$vux.toast.text("微信接口调用成功");
    });
    wx.error(function (res) {
      console.log(res);
      this.$vux.toast.text(res);
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
  font-size: 18px;
  line-height: 28px;
}

.FONT-COMPLETE {
  font-size: 18px;
  line-height: 28px;
  background-color: #3cc51f;
  color: #fff;
}

.FONT-OVERCOMPLETE {
  font-size: 18px;
  line-height: 28px;
  background-color: #ffbe00;
  color: #fff;
}

.FONT-COMPLETE :active {
  font-size: 18px;
  background-color: #ce272d;
  color: #fff;
}

.FONT-OVERCOMPLETE :active {
  font-size: 18px;
  background-color: #ce272d;
  color: #fff;
}

.FONT-SELECTED {
  font-size: 18px;
  background-color: #003057;
  color: #fff;
}

.FONT-SINGLEPACKNO {
  font-size: 18px;
  background-color: #003057;
  color: #fff;
}

.FONT-DOUBLEPACKNO {
  font-size: 18px;
  background-color: #ffbe00;
  color: #fff;
}
.currentPackageNo {
  text-align: center;
}
</style>
