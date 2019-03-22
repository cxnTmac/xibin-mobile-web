<template>
  <div>
    <sticky>
      <x-header :left-options="{preventGoBack:true}" @on-click-back = "onClickBack">配件类型</x-header>
    </sticky>
    <panel header="配件类型"  :list="list" type="1" @on-click-item="onClickItem"></panel>
  </div>
</template>

<script>
import {Group, Cell, XInput, XButton, Alert, AlertPlugin, Divider, Panel, XHeader, Sticky} from 'vux'
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
    XHeader,
    Sticky
  },
  data () {
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      fittingTypes: [],
      list: []
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
      // 使用vuex缓存状态
      this.$store.commit('changeType', {code: item.code, name: item.title})
      this.$store.commit('changeFuzzyCondition', '')
      // this.$router.push({path: '/fittingSkuSelect/', query: {code: item.code, name: item.title}})
      this.$router.push('/fittingSkuSelect')
    }
  },
  mounted () {
    this.getTypes()
  }
}
</script>

<style>

</style>
