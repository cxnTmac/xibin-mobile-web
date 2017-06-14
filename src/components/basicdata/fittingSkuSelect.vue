<template>
  <div>
    <x-header :left-options="{preventGoBack:true}" @on-click-back = "onClickBack">产品列表</x-header>
    <group title="产品配件类型">
      <popup-picker :title="fittingTypeTitle" :data="fittingTypeList" :columns="1" v-model="fittingTypeCode" @on-show="onShow" @on-hide="onHide" @on-change="onChange" show-name placeholder="please select"></popup-picker>
    </group>
    <panel :header="fittingTypeName" :footer="footer" :list="skulist" type="1" @on-click-item="onClickItem"></panel>
  </div>
</template>

<script>
import {Group, Cell, XInput, XButton, Alert, AlertPlugin, Divider, Panel, PopupPicker, XHeader} from 'vux'
// import {requestLogin} from '../api/sysApi'
import {getFittingTypeList} from '../../api/fittingTypeApi'
import {getFittingSkuListPage} from '../../api/fittingSkuApi'
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
    PopupPicker,
    XHeader
  },
  data () {
    return {
      fittingTypeCode: [],
      fittingTypeName: '',
      total: 0,
      size: 10,
      page: 1,
      fittingTypeTitle: '配件类型',
      fittingTypeList: [],
      fittingSkuList: [],
      skulist: [],
      footer: {
        title: '查看更多'
      }
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
    }
  },
  methods: {
    onClickBack () {
      this.$router.push({path: '/fittingTypeSelect/'})
    },
    getfittingTypeNameByFittingTypeValue (value) {
      for (let i = 0; i < this.fittingTypeList.length; i++) {
        if (this.fittingTypeList[i].fittingTypeCode === value) {
          return this.fittingTypeList[i].fittingTypeName
        }
      }
      return ''
    },
    onChange (val) {
      console.log(val)
      if (val === this.fittingTypeCode) {
        return
      } else {
        // 如果配件类别的值改变，则将产品列表清空
        this.fittingTypeCode = [val]
        this.fittingTypeName = this.getfittingTypeNameByFittingTypeValue(val)
        this.skulist = []
        this.fittingSkuList = []
        this.getSkus()
      }
    },
    onShow () {
    },
    onHide (type) {
    },
    onClickItem (item) {
      this.$router.push({path: '/fittingSkuShow/', query: {fittingSkuCode: item.fittingSkuCode}})
    },
    getSkus () {
      let para = {page: this.page, size: this.size, conditions: {fittingTypeCode: this.fittingTypeCode[0]}}
      getFittingSkuListPage(para).then((res) => {
        this.fittingSkuList.push.apply(this.fittingSkuList, res.data.list)
        this.total = res.data.list.size
        // let types = []
        for (var i = 0; i < this.fittingSkuList.length; i++) {
          this.skulist.push({fittingSkuCode: this.fittingSkuList[i].fittingSkuCode, src: this.fittingSkuList[i].fittingSkuPicUrl, title: this.fittingSkuList[i].fittingSkuName, desc: this.fittingSkuList[i].modelCode})
        }
      })
    },
    getTypes () {
      let para = {}
      getFittingTypeList(para).then((res) => {
        let fittingTypes = res.data
        // let types = []
        this.fittingTypeList = []
        for (var i = 0; i < fittingTypes.length; i++) {
          this.fittingTypeList.push({name: fittingTypes[i].fittingTypeName, value: fittingTypes[i].fittingTypeCode})
        }
      })
    }
  },
  mounted () {
    this.fittingTypeCode = [this.$route.query.code]
    this.fittingTypeName = this.$route.query.name
    this.getTypes()
    this.getSkus()
  }
}
</script>

<style>

</style>
