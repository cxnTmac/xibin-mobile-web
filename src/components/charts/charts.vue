<template>
  <section>
    <div style="height: 44px; z-index: 999">
      <sticky>
        <x-header
          :left-options="{ preventGoBack: true }"
          @on-click-back="onClickBack"
          >数据图表</x-header
        >
      </sticky>
      <div style="margin-top: 44px">
        <datetime v-model="date" title="日期" @on-change="onConfirm"></datetime>
        <div
          id="chartPie"
          style="width: 90%; height: 480px; padding: 20px"
        ></div>
        <div
          id="chartPieDay"
          style="width: 90%; height: 480px; padding: 20px"
        ></div>
      </div>
    </div>
  </section>
</template>

<script>
import wx from "weixin-js-sdk";
import { Group, XHeader, Sticky, Datetime } from "vux";
// import {requestLogin} from '../api/sysApi'
// import {getFittingTypeList} from '../../api/fittingTypeApi'
// import {getFittingSkuListPage} from '../../api/fittingSkuApi'
// import {getFittingModelList} from '../../api/modelApi'
import {
  monthSaleByDate,
  pieChartAndMapForMonthSaleByProvince,
  pieChartForCurrentMonthSaleByType,
} from "../../api/chartsApi";
import Vue from "vue";
import axios from "axios";
import util from "../../../common/js/util";
import * as echarts from "echarts";
import NP from "number-precision";
export default {
  components: {
    Group,
    XHeader,
    Sticky,
    Datetime,
  },
  data() {
    return {
      date: "",
      chartPie: null,
      chartPieDay: null,
      pieChartData: [],
      pieChartDayData: [],
    };
  },
  methods: {
    onClickBack() {
      this.$router.push({
        path: "/menu/",
      });
    },
    onConfirm() {
      this.drawPieChart();
      this.drawPieChartDay();
    },
    drawPieChart() {
      this.chartPie = echarts.init(
        document.getElementById("chartPie"),
        "macarons"
      );
      pieChartForCurrentMonthSaleByType({ month: this.date })
        .then((res) => {
          this.pieChartData = res.data;
          let usefuleData = this.convertPieChartData(this.pieChartData);
          this.chartPie.setOption({
            title: {
              text: "产品分类销售饼图",
              subtext: "单月销售:" + usefuleData.totalSale,
              x: "left",
            },
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b} : {c} ({d}%)",
            },
            legend: {
              orient: "vertical",
              left: "right",
              data: usefuleData.legendData,
            },
            series: [
              {
                name: "产品类别",
                type: "pie",
                radius: "80%",
                center: ["40%", "50%"],
                data: usefuleData.seriesData,
                itemStyle: {
                  emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                  },
                },
              },
            ],
          });
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
    },
    drawPieChartDay() {
      this.chartPieDay = echarts.init(
        document.getElementById("chartPieDay"),
        "macarons"
      );
      pieChartForCurrentMonthSaleByType({ day: this.date })
        .then((res) => {
          this.pieChartDayData = res.data;
          let usefuleData = this.convertPieChartData(this.pieChartDayData);
          this.chartPieDay.setOption({
            title: {
              text: "产品分类销售饼图",
              subtext: "单日销售:" + usefuleData.totalSale,
              x: "left",
            },
            tooltip: {
              trigger: "item",
              formatter: "{a} <br/>{b} : {c} ({d}%)",
            },
            legend: {
              orient: "vertical",
              left: "right",
              data: usefuleData.legendData,
            },
            series: [
              {
                name: "产品类别",
                type: "pie",
                radius: "80%",
                center: ["40%", "50%"],
                data: usefuleData.seriesData,
                itemStyle: {
                  emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: "rgba(0, 0, 0, 0.5)",
                  },
                },
              },
            ],
          });
        })
        .catch((data) => {
          util.errorCallBack(data, this.$router);
        });
    },
    convertPieChartData(pieChartData) {
      let usefulData = {
        legendData: [],
        seriesData: [],
        totalSale: 0,
      };
      let othersSalesSum = 0;
      let totalSale = 0;
      for (let i = 0; i < pieChartData.length; i++) {
        if (pieChartData[i].fittingTypeName === "挖掘机配件") {
          usefulData.legendData.push(pieChartData[i].fittingTypeName);
          usefulData.seriesData.push({
            value: pieChartData[i].sales,
            name: pieChartData[i].fittingTypeName,
          });
        } else {
          othersSalesSum = NP.plus(pieChartData[i].sales, othersSalesSum);
        }
        totalSale = NP.plus(pieChartData[i].sales, totalSale);
      }
      usefulData.legendData.push("汽车配件");
      usefulData.seriesData.push({
        value: othersSalesSum,
        name: "汽车配件",
      });
      usefulData.totalSale = totalSale;
      return usefulData;
    },
  },
  created() {},
  mounted() {
    let now = new Date();
    let cmonth = now.getMonth() + 1;
    let day = now.getDate();
    if (cmonth < 10) cmonth = "0" + cmonth;
    if (day < 10) day = "0" + day;
    this.date = now.getFullYear() + "-" + cmonth + "-" + day;
    this.drawPieChart();
    this.drawPieChartDay();
  },
};
</script>

<style></style>
