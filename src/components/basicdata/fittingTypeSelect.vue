<template>
  <div>
    <x-header :left-options="{preventGoBack:true}" @on-click-back = "onClickBack">配件类型</x-header>
    <panel header="配件类型"  :list="list" type="1" @on-click-item="onClickItem"></panel>
  </div>
</template>

<script>
import {Group, Cell, XInput, XButton, Alert, AlertPlugin, Divider, Panel, XHeader} from 'vux'
import {getFittingTypeList} from '../../api/fittingTypeApi'
// import {requestLogin} from '../api/sysApi'
import Vue from 'vue'
Vue.use(AlertPlugin)
export default {
  components: {
    Group,
    Cell,
    XInput,
    XButton,
    Alert,
    AlertPlugin,
    Divider,
    Panel,
    XHeader
  },
  data () {
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      fittingTypes: [],
      list: [{
        src: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '半轴/行星齿轮',
        desc: '由各种物质组成的巨型球状天体，叫做星球。星球有一定的形状，有自己的运行轨道。',
        url: '/component/cell'
      }, {
        src: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '刹车蹄片轴/滚轮',
        desc: '由各种物质组成的巨型球状天体，叫做星球。星球有一定的形状，有自己的运行轨道。',
        url: '/component/cell'
      }, {
        src: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '差速器/盆角齿螺丝',
        desc: '由各种物质组成的巨型球状天体，叫做星球。星球有一定的形状，有自己的运行轨道。',
        url: '/component/cell'
      }, {
        src: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '差速器十字轴',
        desc: '由各种物质组成的巨型球状天体，叫做星球。星球有一定的形状，有自己的运行轨道。',
        url: '/component/cell'
      }, {
        src: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '传动轴/手刹/减震器螺丝',
        desc: '由各种物质组成的巨型球状天体，叫做星球。星球有一定的形状，有自己的运行轨道。',
        url: '/component/cell'
      }, {
        src: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '传动轴万向节',
        desc: '由各种物质组成的巨型球状天体，叫做星球。星球有一定的形状，有自己的运行轨道。',
        url: '/component/cell'
      }, {
        src: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '传动轴支架总成',
        desc: '由各种物质组成的巨型球状天体，叫做星球。星球有一定的形状，有自己的运行轨道。',
        url: '/component/cell'
      }, {
        src: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '发动机/发电机件',
        desc: '由各种物质组成的巨型球状天体，叫做星球。星球有一定的形状，有自己的运行轨道。',
        url: '/component/cell'
      }, {
        src: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '分离轴承座',
        desc: '由各种物质组成的巨型球状天体，叫做星球。星球有一定的形状，有自己的运行轨道。',
        url: '/component/cell'
      }, {
        src: 'http://placeholder.qiniudn.com/60x60/3cc51f/ffffff',
        title: '钢板吊耳',
        desc: '由各种物质组成的巨型球状天体，叫做星球。星球有一定的形状，有自己的运行轨道。',
        url: '/component/cell'
      }]
    }
  },
  methods: {
    onClickBack () {
      this.$router.push({path: '/Menu'})
    },
    getTypes () {
      let para = {}
      getFittingTypeList(para).then((res) => {
        this.fittingTypes = res.data
        this.list = []
        for (var i = 0; i < this.fittingTypes.length; i++) {
          // let url = {path: '/fittingSkuSelect/' + this.fittingTypes[i].fittingTypeCode, query: this.fittingTypes[i].fittingTypeCode}
          this.list.push({title: this.fittingTypes[i].fittingTypeName, code: this.fittingTypes[i].fittingTypeCode})
          // this.list.push({title: this.fittingTypes[i].fittingTypeName, url: url})
        }
      })
    },
    onClickItem (item) {
      this.$router.push({path: '/fittingSkuSelect/', query: {code: item.code, name: item.title}})
    }
  },
  mounted () {
    this.getTypes()
  }
}
</script>

<style>

</style>
