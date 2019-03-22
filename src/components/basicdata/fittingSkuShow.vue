<template>
  <div>
    <sticky>
      <x-header :left-options="{preventGoBack:true}" @on-click-back = "onClickBack">产品详情</x-header>
    </sticky>
    <!--<swiper aspect-ratio :height="getWindowHeight" v-model="index">-->
    <swiper :aspect-ratio="3/4"  v-model="index">
      <swiper-item  v-for="(item, index) in getZipPics" :key="index">
        <!--<img :src="item.img" @click="show(index)" :width="getSwiperWidth(item)">-->
        <div class="swiperDiv">
          <img :src="item.img" @click="show(index)" class="swiperImg">
        </div>
      </swiper-item>
    </swiper>
    <form-preview header-label="产品信息" header-value="轮胎螺丝" :body-items="skuDataToFormList" :footer-buttons="buttons1"></form-preview>
    <div v-transfer-dom>
      <previewer :list="getPreviewPics" ref="previewer" ></previewer>
    </div>
  </div>
</template>

<script>
import {Group, Cell, XInput, XButton, Alert, AlertPlugin, Scroller, Swiper, SwiperItem, FormPreview, Divider, Previewer, TransferDom, XHeader, Sticky} from 'vux'
// import {requestLogin} from '../api/sysApi'
import {getFittingSkuBySkuCode, getFittingSkuPicBySkuCode} from '../../api/fittingSkuApi'
import Vue from 'vue'
Vue.use(AlertPlugin)

const baseList = [{
  url: 'javascript:',
  img: 'https://static.vux.li/demo/1.jpg',
  title: '送你一朵fua'
}, {
  url: 'javascript:',
  img: 'https://static.vux.li/demo/2.jpg',
  title: '送你一辆车'
}, {
  url: 'javascript:',
  img: 'https://static.vux.li/demo/3.jpg',
  title: '送你一次旅行'
}]
const imgList = [
  'http://placeholder.qiniudn.com/800x300/FF3B3B/ffffff',
  'http://placeholder.qiniudn.com/800x300/FFEF7D/ffffff',
  'http://placeholder.qiniudn.com/800x300/8AEEB1/ffffff'
]
const demoList = imgList.map((one, index) => ({
  url: 'javascript:',
  img: one
}))
export default {
  directives: {
    TransferDom
  },
  components: {
    Group,
    Cell,
    XInput,
    XButton,
    Alert,
    AlertPlugin,
    Scroller,
    Swiper,
    SwiperItem,
    FormPreview,
    Divider,
    Previewer,
    XHeader,
    Sticky
  },
  data () {
    return {
      fittingSku: null,
      fittingSkuPics: [],
      index: 2,
      demo01_list: baseList,
      demo02_list: demoList,
      list2: [{
        src: 'https://ooo.0o0.ooo/2017/05/17/591c271ab71b1.jpg',
        w: 800,
        h: 400
      }, {
        src: 'https://ooo.0o0.ooo/2017/05/17/591c271acea7c.jpg',
        w: 1200,
        h: 900
      }],
      list: [{
        label: '产品',
        value: '后轮胎螺丝20*76长'
      }, {
        label: '车型',
        value: 'BJ130'
      }, {
        label: '材质',
        value: '40Cr'
      }, {
        label: '类别',
        value: '轮胎螺丝'
      }, {
        label: '参考价格',
        value: '4.00'
      }],
      buttons1: [{
        style: 'primary',
        text: '查看库存'
      }, {
        style: 'default',
        text: '返回',
        link: '/fittingSkuSelect/'
      }]
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
    }
  },
  computed: {
    fittingSkuCode: function () {
      return this.$store.state.basicdata.fittingSkuCode
    },
    skuDataToFormList: function () {
      let list = []
      if (this.fittingSku !== null) {
        list.push({label: '产品', value: this.fittingSku.fittingSkuName})
        list.push({label: '车型', value: this.fittingSku.modelCode})
        list.push({label: '材质', value: this.fittingSku.materialquality})
        list.push({label: '类别', value: this.fittingSku.fittingTypeName})
        list.push({label: '参考价格', value: this.fittingSku.price})
      }
      return list
    },
    getWindowHeight: function () {
      let height
      if (document.body.scrollHeight > document.body.scrollWidth) {
        height = document.body.scrollHeight / 3
      } else {
        height = document.body.scrollHeight / 2
      }
      return height.toString() + 'px'
    },
    getZipPics: function () {
      let list = []
      let type = 'ZIP'
      if (document.body.scrollHeight * document.body.scrollWidth > 1000 * 1000) {
        type = 'NORMAL'
      }
      for (let i = 0; i < this.fittingSkuPics.length; i++) {
        if (this.fittingSkuPics[i].type === type) {
          list.push({url: 'javascript:', img: this.fittingSkuPics[i].fittingSkuPicUrl, title: this.fittingSkuPics[i].fittingSkuPicName, w: this.fittingSkuPics[i].width, h: this.fittingSkuPics[i].height})
        }
      }
      return list
    },
    getPreviewPics: function () {
      let list = []
      for (let i = 0; i < this.fittingSkuPics.length; i++) {
        if (this.fittingSkuPics[i].type === 'NORMAL') {
          list.push({src: this.fittingSkuPics[i].fittingSkuPicUrl, w: this.fittingSkuPics[i].width, h: this.fittingSkuPics[i].height})
        }
      }
      return list
    }
  },
  methods: {
    onClickBack () {
      this.$router.push({path: '/fittingSkuSelect/'})
    },
    getSwiperWidth: function (item) {
      if (item.w <= document.body.scrollWidth) {
        return '100%'
      } else {
        return item.w + 'px'
      }
    },
    show (index) {
      this.$refs.previewer.show(index)
    },
    getSku () {
      let para = {fittingSkuCode: this.fittingSkuCode}
      getFittingSkuBySkuCode(para).then((res) => {
        this.fittingSku = res.data
      })
    },
    getSkuPics () {
      let para = {fittingSkuCode: this.fittingSkuCode}
      getFittingSkuPicBySkuCode(para).then((res) => {
        this.fittingSkuPics = res.data
      })
    }
  },
  mounted () {
    this.getSku()
    this.getSkuPics()
  }
}
</script>

<style>
.swiperDiv{
  vertical-align:middle;
  horiz-align:center;
  text-align: center;
}
.swiperImg{
  margin: 0px;
}
</style>
