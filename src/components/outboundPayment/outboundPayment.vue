<template>
  <div>
    <div style="height: 44px; z-index: 999">
      <sticky>
        <x-header :left-options="{ preventGoBack: true }" @on-click-back="onClickBack">销售打款情况</x-header>
      </sticky>
    </div>
    <!--<video autoplay class="video" style="height: 400px"></video>-->
    <popup-picker title="请选择月份" :data="month" v-model="currentMonth" @on-show="onShow" @on-hide="onHide"
      @on-change="onChange" placeholder="请选择月份"></popup-picker>
    <tab>
      <tab-item selected @on-item-click="unPayTabClickHandler">未付款</tab-item>
      <tab-item @on-item-click="payTabClickHandler">已付款</tab-item>
    </tab>
    <div>
      <x-table>
        <thead>
          <tr class="FONT-HEADER">
            <!-- <th style="width: 6%">单号</th> -->
            <th style="width: 23%">时间</th>
            <th>客户</th>
            <th style="width: 12%">金额</th>
            <th style="width: 12%">收款</th>
            <th style="width: 10%">类别</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="(item, index) in orders">
            <tr v-bind:key="index" class="FONT">
              <!-- <td>{{ item.orderNo }}</td> -->
              <td>{{ item.orderTime }}</td>
              <td>{{ item.buyerName }}</td>
              <td>{{ item.totalPrice }}</td>
              <td>{{ item.cash }}</td>
              <td :class="getColorByPaymentCategory(item.paymentCategory)">{{ getComboNameByValue(PAYMENT_CATEGORY,
          item.paymentCategory) }}</td>
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
import {
  getOutboundOrderListPage
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
      month: [['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']],
      currentMonth: ['1月'],
      orders: [],
      page: 1,
      size: 999,
      total: 0,
      multiStatus: "'99'" + "," + "'80'",
      isRecievedCash: 'N',
      orderTimeFm: '',
      orderTimeTo: '',
      PAYMENT_CATEGORY: codemaster.BD_CUSTOMER_PAYMENT_CATEGORY
    };
  },
  computed: {
  },
  methods: {
    onShow() {
      console.log("显示月份选择")
    },
    onHide() {
      console.log("结束月份选择")
    },
    onChange(val) {
      let selectMonth = val[0].replace('月', '')-1;
      let nowYear = new Date().getFullYear(); //当前年
      //选择月份开始时间
      let selectMonthStartDate = new Date(nowYear, selectMonth, 1);
      //选择月份结束时间
      let selectMonthEndDate = new Date(nowYear, selectMonth + 1, 1);
      this.orderTimeFm = selectMonthStartDate;
      this.orderTimeTo = selectMonthEndDate;
      this.getOrders();
    },
    getComboNameByValue(comboValue, value) {
      return util.getComboNameByValue(comboValue, value);
    },
    getColorByPaymentCategory: function (paymentCategory) {
      if (paymentCategory === 'CASH') {
        return 'FONT-DOUBLEPACKNO';
      } if (paymentCategory === 'ON_DELIVERY') {
        return 'FONT-SINGLEPACKNO';
      } if (paymentCategory === 'PERIOD') {
        return 'default';
      }
    },
    getStatus: function (status) {
      return util.getComboNameByValue(
        codemaster.WM_OUTBOUND_STATUS,
        status
      );
    },
    unPayTabClickHandler: function () {
      this.isRecievedCash = 'N',
        this.getOrders();
    },
    payTabClickHandler: function () {
      this.isRecievedCash = 'Y',
        this.getOrders();
    },
    onClickBack() {
      this.$router.push({ path: "/menu/" });
    },
    getOrders() {
      let para = {
        page: this.detailPage,
        size: this.detailSize,
        conditions: JSON.stringify({
          multiStatus: this.multiStatus,
          orderTimeFm: this.orderTimeFm,
          orderTimeTo: this.orderTimeTo,
          isRecievedCash: this.isRecievedCash
        }),
      };
      getOutboundOrderListPage(para)
        .then((res) => {
          this.orders = res.data.list;
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
    },
    onSubmit() {
      // 重置页码为第一页
      this.page = 1;
      this.getOrders();
    }
  },
  created() {
    this.page = 1;
  },
  mounted() {
    let now = new Date(); //当前日期
    let nowMonth = now.getMonth(); //当前月
    let nowYear = now.getFullYear(); //当前年
    this.currentMonth = [(nowMonth + 1) + '月'];
    //本月的开始时间
    let monthStartDate = new Date(nowYear, nowMonth, 1);
    //本月的结束时间
    let monthEndDate = new Date(nowYear, nowMonth + 1, 1);
    this.orderTimeFm = monthStartDate;
    this.orderTimeTo = monthEndDate;
    this.getOrders();
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

.FONT-SINGLEPACKNO {
  font-size: 16px !important;
  background-color: #003057;
  color: #fff;
}

.FONT-DOUBLEPACKNO {
  font-size: 16px !important;
  background-color: #ffbe00;
  color: #fff;
}
</style>
