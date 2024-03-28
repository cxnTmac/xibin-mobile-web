<template>
  <div>
    <div style="height: 44px; z-index: 999">
      <sticky>
        <x-header :left-options="{ preventGoBack: true }" @on-click-back="onClickBack">出库发货<a slot="right"
            @click="scan">扫描</a></x-header>
        <search @on-change="changeOrderNo" v-model="orderNo" position="absolute" auto-scroll-to-top top="46px"
          @on-submit="onSubmit" placeholder="输入出库单号" ref="search">
          <!--<slots name="right"><x-button @click.native="scan">扫描</x-button></slots>-->
        </search>
      </sticky>
    </div>
    <!--<video autoplay class="video" style="height: 400px"></video>-->
    <group title="日期">
      <datetime v-model="date" title="日期" @on-change="onConfirm"></datetime>
    </group>
    <tab style="margin-top: 0px">
      <tab-item selected @on-item-click="allTabClickHandler">全部</tab-item>
      <tab-item @on-item-click="unShipTabClickHandler">未完全发货</tab-item>
      <tab-item @on-item-click="shipTabClickHandler">已完全发货</tab-item>
    </tab>
    <div v-transfer-dom>
      <popup v-model="pickUpShow" height="270px" is-transparent>
        <div style="
            width: 95%;
            background-color: #fff;
            height: 250px;
            margin: 0 auto;
            border-radius: 5px;
            padding-top: 10px;
          ">
          <group>
            <x-input title="拣货数" type="number" text-align="right" :required="true" v-model="pickNumInput"></x-input>
          </group>
          <div style="padding: 20px 15px">
            <x-button type="primary" @click.native="pickUpSumbmit">拣货确认</x-button>
            <x-button @click.native="pickUpShow = false">取消</x-button>
          </div>
        </div>
      </popup>
    </div>
    <div v-for="(item, index) in orders" class="cardBox">
      <div @click="toDetail(item)">
        <form-preview class="inCard" header-label="发货信息" :header-value="getStatus(index)"
          :body-items="skuDataToFormList(index)">
        </form-preview>
        <cell title="客户类型"><x-button mini :type="getColorByPaymentCategory(item.paymentCategory)">{{
          getComboNameByValue(PAYMENT_CATEGORY, item.paymentCategory) }}</x-button>
        </cell>
        <cell title="是否打款"><x-button mini :type="getColorByIsReceivedCash(item.isRecievedCash)">{{
          getComboNameByValue(IS_RECEIVED_CASH, item.isRecievedCash) }}</x-button>
        </cell>
      </div>
      <grid :rows="3" v-if="multiStatus !== null">
        <grid-item class="cardItem">
          <x-button v-if="!btnShipStatus(index)" class="cardButtonLeft" type="default"
            @click.native="printCustomerLabel(index)">打印标签</x-button>
          <x-button v-show="btnShipStatus(index)" class="cardButtonLeft" type="primary"
            @click.native="ship(index)">发货</x-button>
        </grid-item>
        <grid-item class="cardItem">
          <x-button class="cardButtonMid" type="default" @click.native="printBoxLabel(index)">打印装箱单</x-button>
        </grid-item>
        <grid-item class="cardItem">
          <x-button v-if="!btnCancelShipStatus(index)" class="cardButtonRight" type="default"
            @click.native="printCustomerLabel(index)">打印标签</x-button>
          <x-button v-show="btnCancelShipStatus(index)" class="cardButtonRight" type="warn"
            @click.native="cancelShip(index)">取消发货</x-button>
        </grid-item>
      </grid>
    </div>
    <div>
      <grid :rows="3" style="margin-top: 20px">
        <grid-item class="cardItem">
          <x-button class="cardButton" @click.native="prePage" type="primary">上一页</x-button>
        </grid-item>
        <grid-item class="cardItem">
          <div style="text-align: center; font-size: 26px">
            {{ this.total === 0 ? 0 : this.page }}/{{
          Math.ceil(this.total / this.size)
        }}
          </div>
        </grid-item>
        <grid-item class="cardItem">
          <x-button class="cardButton" @click.native="nextPage" type="primary">下一页</x-button>
        </grid-item>
      </grid>
    </div>
    <div v-transfer-dom>
      <popup v-model="shipShow" height="270px" is-transparent>
        <div style="
            width: 95%;
            background-color: #fff;
            height: 250px;
            margin: 0 auto;
            border-radius: 5px;
            padding-top: 10px;
          ">
          <group>
            <x-textarea title="备注" v-model="mark"></x-textarea>
          </group>
          <div style="padding: 20px 15px">
            <x-button type="primary" @click.native="getPackageNum">件数自动计算</x-button>
            <x-button type="primary" @click.native="shipSubmit">发货确认</x-button>
          </div>
        </div>
      </popup>
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
  ToastPlugin,
  Datetime,
  XTextarea
} from "vux";
import util from "../../common/util";
// import {requestLogin} from '../api/sysApi'
// import {getFittingTypeList} from '../../api/fittingTypeApi'
// import {getFittingSkuListPage} from '../../api/fittingSkuApi'
// import {getFittingModelList} from '../../api/modelApi'
import {
  getOutboundOrderListPage,
  shipByHeader,
  cancelShipByHeader,
  getTotalPackageNumByOrderNo,
  saveOutboundOrder
} from "../../api/outboundApi";
import Vue from "vue";
import { requestAccessToken } from "../../api/sysApi";
var codemaster = require("../../../static/codemaster.json");
var config = require("../../../static/config.json");
Vue.use(AlertPlugin);
Vue.use(LoadingPlugin);
Vue.use(ToastPlugin);
export default {
  directives: {
    TransferDom,
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
    ToastPlugin,
    Datetime,
    XTextarea
  },
  data() {
    return {
      date: "",
      orderNo: "",
      orders: [],
      page: 1,
      size: 5,
      total: 0,
      listLoading: false,
      sels: [],
      pickUpShow: false,
      pickNumInput: 0,
      currentIndex: 0,
      multiStatus: null,
      shipShow: false,
      mark: '',
      PAYMENT_CATEGORY: codemaster.BD_CUSTOMER_PAYMENT_CATEGORY,
      OUTBOUND_TYPE: codemaster.WM_OUTBOUND_TYPE,
      IS_RECEIVED_CASH: codemaster.WM_IS_RECIEVED_CASH
    };
  },
  methods: {
    getComboNameByValue(comboValue, value) {
      return util.getComboNameByValue(comboValue, value);
    },
    toDetail(item) {
      this.$store.commit("changeQueryDate", this.date);
      this.$router.push({
        path: "/outboundDetail",
        query: {
          orderNo: item.orderNo,
          customerName: item.buyerName,
          status: util.getComboNameByValue(
            codemaster.WM_OUTBOUND_STATUS,
            item.status
          ),
        },
      });
    },
    onConfirm() {
      this.getOrders();
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
      this.getOrders();
    },
    unShipTabClickHandler: function () {
      this.multiStatus = "'50'" + "," + "'60'" + "," + "'70'";;
      this.getOrders();
    },
    shipTabClickHandler: function () {
      this.multiStatus = "'80'";
      this.getOrders();
    },
    btnShipStatus: function (index) {
      if (this.orders[index].status === "60" || this.orders[index].status === "50" || this.orders[index].status === "70") {
        return true;
      } else if (this.orders[index].status === "80") {
        return false;
      }
    },
    btnCancelShipStatus: function (index) {
      if (this.orders[index].status === "60" || this.orders[index].status === "50") {
        return false;
      } else if (this.orders[index].status === "80" || this.orders[index].status === "70") {
        return true;
      }
    },
    onClickBack() {
      this.$router.push({
        path: "/menu/",
      });
    },
    getStatus: function (index) {
      if (this.orders[index].status === "00") {
        return util.getComboNameByValue(
          codemaster.SYS_AUDIT_STATUS,
          this.orders[index].auditStatus
        ) + " | " + util.getComboNameByValue(
          codemaster.WM_OUTBOUND_STATUS,
          this.orders[index].status
        );
      } else {
        return util.getComboNameByValue(
          codemaster.WM_OUTBOUND_STATUS,
          this.orders[index].status);
      }
    },
    getColorByPaymentCategory: function (paymentCategory) {
      if (paymentCategory === 'CASH') {
        return 'primary';
      } if (paymentCategory === 'ON_DElLIVERY') {
        return 'warn';
      } if (paymentCategory === 'PERIOD') {
        return 'default';
      }
    },
    getColorByIsReceivedCash: function (isReceiveCash) {
      if (isReceiveCash === 'Y') {
        return 'primary';
      } if (isReceiveCash === 'N') {
        return 'warn';
      } else {
        return 'default';
      }
    },
    skuDataToFormList: function (index) {
      let list = [];
      if (this.orders[index] !== null) {
        list.push({
          label: "出库单号",
          value: this.orders[index].orderNo,
        });
        list.push({
          label: "客户编码",
          value: this.orders[index].buyerCode,
        });
        list.push({
          label: "客户名称",
          value: this.orders[index].buyerName,
        });
        // list.push({
        //   label: "订单类型",
        //   value: util.getComboNameByValue(this.OUTBOUND_TYPE,this.orders[index].outboundType),
        // });
        // list.push({
        //   label: "是否打款",
        //   value: util.getComboNameByValue(this.IS_RECEIVED_CASH,this.orders[index].isReceiveCash),
        // });
      }
      return list;
    },
    getOrders() {
      let para = {
        page: this.page,
        size: this.size,
        conditions: JSON.stringify({
          orderNo: this.orderNo,
          multiStatus: this.multiStatus,
          orderTimeFm: this.date + " " + "00:00:00",
          orderTimeTo: this.date + " " + "23:59:59",
        }),
      };
      getOutboundOrderListPage(para)
        .then((res) => {
          this.total = res.data.size;
          this.orders = res.data.list;
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
    },
    onSubmit() {
      // 重置页码为第一页
      this.page = 1;
      this.orders = [];
      this.getOrders();
    },
    getPackageNum() {
      let para = { orderNo: this.orders[this.currentIndex].orderNo };
      getTotalPackageNumByOrderNo(para)
        .then((res) => {
          this.mark = res.data.data + '';
        }).catch((data) => {
          util.errorCallBack(data, this.$router, this.$message);
        });
    },
    copyToClipboard(order) {
      let _this = this;
      let str = "订单[" + order.orderNo + "]" + "</br>" + "货主[" + order.buyerName + "]" + "</br>" + "已经发货！请打印清单，信封以及装箱单！"
      let strForCopy = "订单[" + order.orderNo + "]" + "\n" + "货主[" + order.buyerName + "]" + "\n" + "已经发货！请打印清单，信封以及装箱单！"
      util.syncHandle(() => {
        this.$copyText(strForCopy).then(
          (success) => {
            _this.$vux.alert.show({
              title: '发货成功',
              content: str
            });
            console.log('复制成功');
          },
          (err) => {
            _this.$vux.alert.show({
              title: '复制消息失败',
              content: '无法复制消息！'
            });
            console.error('复制失败', err);
          }
        )
      });
    },
    shipSubmit() {
      let newOrder = this.orders[this.currentIndex];
      newOrder.remark = this.mark;
      let orderNo = newOrder.orderNo;
      saveOutboundOrder({
        order: JSON.stringify(newOrder)
      }).then(
        (res) => {
          if (res.data.code != 200) {
            this.$vux.toast.text(res.data.msg, "buttom");
          } else {
            shipByHeader({
              orderNo: orderNo,
            })
              .then((res) => {
                this.copyToClipboard(newOrder);
                this.$vux.toast.text(res.data.msg, "buttom");
                if (res.data.code === 200) {
                  this.shipShow = false;
                  this.getOrders();
                }
              })
              .catch((data) => {
                util.errorCallBack(data, this.$router);
              });
          }
        }).catch((data) => {
          util.errorCallBack(data, this.$router);
        });

    },
    ship(index) {
      this.currentIndex = index;
      this.shipShow = true;
      this.mark = this.orders[index].remark;
    },
    printBoxLabel(index) {
      let user = JSON.parse(localStorage.getItem("user"));
      window.open(
        config.reportUrl +
        "pack?orderNo=" +
        this.orders[index].orderNo +
        "&companyId=" +
        user.companyId +
        "&warehouseId=" +
        user.warehouseId +
        "&mobileUrl=" +
        config.mobileUrl +
        "outboundPick?orderNo="
      );
    },
    printCustomerLabel(index) {
      this.currentIndex = index;
      let user = JSON.parse(localStorage.getItem("user"));
      window.open(
        config.reportUrl +
        "customerLabelForOrder?customerCode=" +
        this.orders[index].buyerCode +
        "&companyId=" +
        user.companyId
      );
    },
    cancelShip(index) {
      cancelShipByHeader({
        orderNo: this.orders[index].orderNo,
      })
        .then((res) => {
          this.$vux.toast.text(res.data.msg, "buttom");
          if (res.data.code === 200) {
            this.getOrders();
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
        this.getOrders();
      } else if (this.page === totalPage) {
        this.$vux.toast.text("已经是最后一页了", "buttom");
      }
    },
    prePage() {
      let totalPage = Math.ceil(this.total / this.size);
      if (this.page > 1 && this.page <= totalPage) {
        this.page--;
        this.getOrders();
      } else if (this.page === 1) {
        this.$vux.toast.text("已经是第一页了", "buttom");
      }
    },
    setDate() {
      this.date = this.$store.state.outbound.queryDate;
      if (this.date === "" || this.date === null || this.date === undefined) {
        let now = new Date();
        let cmonth = now.getMonth() + 1;
        let day = now.getDate();
        if (cmonth < 10) cmonth = "0" + cmonth;
        if (day < 10) day = "0" + day;
        this.date = now.getFullYear() + "-" + cmonth + "-" + day;
      }
    }
  },
  mounted() {
    this.orderNo = this.$route.query.orderNo;
    this.setDate();
    this.getOrders();
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
  created() {
    window.onQrcodeScanResult = this.onQrcodeScanResult;
  }
};
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

.cardButtonMid {
  margin: 0px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
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
  box-shadow: 2px 2px 2px #b3b3b3;
  padding: 0px;
  border-radius: 5px;
  margin-top: 15px;
  margin-buttom: 15px;
  margin-left: 10px;
  margin-right: 10px;
}

.cardBox {
  box-shadow: 2px 2px 2px #b3b3b3;
  border-radius: 10px;
  margin-top: 15px;
  margin-buttom: 15px;
  margin-left: 10px;
  margin-right: 10px;
}
</style>
