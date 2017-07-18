<template>
  <div>
    <sticky>
      <x-header :left-options="{preventGoBack:true}" @on-click-back = "onClickBack">产品列表</x-header>
      <search
        @on-change="getSearchCondtionResult"
        :results="searchCondtionResults"
        @on-result-click="onSearchCondtionResultClick"
        v-model="fuzzyCondition"
        position="absolute"
        auto-scroll-to-top top="46px"
        @on-focus="onFocus"
        @on-cancel="onCancel"
        @on-submit="onSubmit"
        placeholder="输入车型/产品名称"
        ref="search"></search>
    </sticky>

    <group title="产品配件类型">
      <popup-picker :title="fittingTypeTitle" :data="fittingTypeList" :columns="1" v-model="fittingTypeCode" @on-show="onShow" @on-hide="onHide" @on-change="onChange" show-name placeholder="please select"></popup-picker>
    </group>
    <panel :header="fittingTypeName" :footer="footer" :list="skulist" type="1" @on-click-item="onClickItem" @on-click-footer="onClickFooter"></panel>
  </div>
</template>

<script>
import {Group, Cell, XInput, XButton, Alert, AlertPlugin, Divider, Panel, PopupPicker, XHeader, Search, Sticky, Loading, LoadingPlugin, Toast, ToastPlugin} from 'vux'
// import {requestLogin} from '../api/sysApi'
import {getFittingTypeList} from '../../api/fittingTypeApi'
import {getFittingSkuListPage} from '../../api/fittingSkuApi'
import {getFittingModelList} from '../../api/modelApi'
import Vue from 'vue'
Vue.use(AlertPlugin)
Vue.use(LoadingPlugin)
Vue.use(ToastPlugin)
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
    XHeader,
    Search,
    Sticky,
    Loading,
    LoadingPlugin,
    Toast,
    ToastPlugin
  },
  data () {
    return {
      searchCondtionResults: [],
      models: [],
//      fittingTypeCode: [],
//      fittingTypeName: '',
      total: 0,
      size: 10,
      page: 1,
      fittingTypeTitle: '配件类型',
      fittingTypeList: [],
      fittingSkuList: [],
      // skulist: [],
      footer: {
        title: '查看更多'
      }
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
    }
  },
  computed: {
    fuzzyCondition: function () {
      return this.$store.state.basicdata.fuzzyCondition
    },
    fittingTypeCode: function () {
      return [this.$store.state.basicdata.fittingType.code]
    },
    fittingTypeName: function () {
      return this.$store.state.basicdata.fittingType.name
    },
    // 商品列表，依赖于从后台获取的商品信息
    skulist: function () {
      let list = []
      for (let i = 0; i < this.fittingSkuList.length; i++) {
        list.push({fittingSkuCode: this.fittingSkuList[i].fittingSkuCode, src: this.fittingSkuList[i].fittingSkuPicUrl, title: this.fittingSkuList[i].fittingSkuName, desc: this.fittingSkuList[i].modelCode})
      }
      return list
    },
    // 查询条件，依赖于页码，每页条数，以及查询条件（配件类别以及模糊查询条件）
    queryCondition: function () {
      let para = {page: this.page, size: this.size, conditions: {fittingTypeCode: this.fittingTypeCode[0]}}
      if (this.fuzzyCondition !== null && this.fuzzyCondition !== '') {
        para.conditions['fuzzyCondition'] = this.fuzzyCondition
      }
      return para
    }
  },
  methods: {
    onClickBack () {
      this.$router.push({path: '/fittingTypeSelect'})
    },
    getfittingTypeNameByFittingTypeValue (value) {
      for (let i = 0; i < this.fittingTypeList.length; i++) {
        if (this.fittingTypeList[i].value === value[0]) {
          return this.fittingTypeList[i].name
        }
      }
      return ''
    },
    onChange (val) {
      if (val === this.fittingTypeCode) {
        return
      } else {
        // 重置页码为第一页
        this.page = 1
        // 如果配件类别的值改变，则将产品列表清空
        this.$store.commit('changeType', {code: val[0], name: this.getfittingTypeNameByFittingTypeValue(val)})
        // this.skulist = []
        this.fittingSkuList = []
        this.getSkus()
      }
    },
    onShow () {
    },
    onHide (type) {
    },
    onClickItem (item) {
      this.$store.commit('changeSkuCode', item.fittingSkuCode)
      this.$router.push('/fittingSkuShow')
    },
    onClickFooter () {
      let totalPage = 0
      if (this.total % this.size === 0) {
        totalPage = this.total / this.size
      } else {
        totalPage = this.total / this.size + 1
      }
      if (this.page < totalPage) {
        this.page++
        this.getSkus()
      } else {
        this.$vux.toast.show({
          text: '没有更多内容了', type: 'cancel'
        })
      }
    },
    getModels () {
      let para = {conditions: {}}
      getFittingModelList(para).then((res) => {
        this.models = res.data
      })
    },
    onSearchCondtionResultClick (item) {
      if (item.other === this.fuzzyCondition) {
        return
      } else {
        this.$store.commit('changeFuzzyCondition', item.other)
        this.onSubmit()
      }
    },
    getSearchCondtionResult (modelName) {
      this.$store.commit('changeFuzzyCondition', modelName)
      this.searchCondtionResults = []
      if (modelName !== null && modelName !== '') {
        for (let i = 0; i < this.models.length; i++) {
          if (this.models[i].modelName.indexOf(modelName) >= 0) {
            this.searchCondtionResults.push({title: '车型：' + this.models[i].modelName, other: this.models[i].modelName})
          }
        }
      }
    },
    getSkus () {
      this.$vux.loading.show({
        text: '加载中'
      })
      getFittingSkuListPage(this.queryCondition).then((res) => {
        this.$vux.loading.hide()
        this.fittingSkuList.push.apply(this.fittingSkuList, res.data.list)
        this.total = res.data.size
        // let types = []
//        this.skulist = []
//        for (var i = 0; i < this.fittingSkuList.length; i++) {
//          this.skulist.push({fittingSkuCode: this.fittingSkuList[i].fittingSkuCode, src: this.fittingSkuList[i].fittingSkuPicUrl, title: this.fittingSkuList[i].fittingSkuName, desc: this.fittingSkuList[i].modelCode})
//        }
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
    },
    setFocus () {
      this.$refs.search.setFocus()
    },
    resultClick (item) {
      window.alert('you click the result item: ' + JSON.stringify(item))
    },
    getResult (val) {
      // this.results = val ? getResult(this.value) : []
    },
    onSubmit () {
      // 重置页码为第一页
      this.page = 1
      this.fittingSkuList = []
      this.getSkus()
//      this.$refs.search.setBlur()
//      this.$vux.toast.show({
//        type: 'text',
//        position: 'top',
//        text: 'on submit'
//      })
    },
    onFocus () {
      console.log('on focus')
    },
    onCancel () {
      console.log('on cancel')
    }
  },
  mounted () {
//    this.fittingTypeCode = [this.$route.query.code]
//    this.fittingTypeName = this.$route.query.name
    this.getTypes()
    this.getSkus()
    this.getModels()
  }
}
</script>

<style>

</style>
