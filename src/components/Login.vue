<template>
  <div>
    <div class="vux-demo">
      <img class="logo" src="../assets/vux_logo.png">
      <h3>西滨精工</h3>
    </div>
    <group title="登陆" labelAlign="left" labelWidth="80px">
      <x-input title="用户名" type="text"  v-model="user.userName" :required="true"></x-input>
      <x-input title="密码" type="password" v-model="user.password" :required="true"></x-input>
      <x-button plain class="custom-primary-blue" @click.native="handleLogin">登陆</x-button>
      <x-button plain class="custom-primary-red">重置</x-button>
    </group>
  </div>
</template>

<script>
import {Group, Cell, XInput, XButton, Alert, AlertPlugin, Grid, GridItem} from 'vux'
import {requestLogin} from '../api/sysApi'
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
    Grid,
    GridItem
  },
  data () {
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      user: {userName: '', password: ''}
    }
  },
  methods: {
    handleLogin: function () {
      let loginParams = {data: JSON.stringify({userName: this.user.userName, password: this.user.password})}
      requestLogin(loginParams).then(resdata => {
        let { msg, code, data } = resdata
        if (code !== 200) {
          this.$vux.alert.show({
            title: '登陆失败',
            content: msg,
            onShow () {

            },
            onHide () {

            }
          })
        } else {
          sessionStorage.setItem('user', JSON.stringify(data))
          this.$router.push({ path: '/Menu' })
        }
      })
    }
  }
}
</script>

<style>
.vux-demo {
  text-align: center;
}
.logo {
  width: 100px;
  height: 100px
}
.custom-primary-blue {
  border-radius: 5px!important;
  border-color: #1413ce !important;
  color: #1413ce!important;
  &:active {
   border-color: rgba(7, 94, 206, 0.6) !important;
   color: rgba(7, 94, 206, 0.6)!important;
   background-color: transparent;
 }
}
.custom-primary-red {
  border-radius: 5px!important;
  border-color: #CE3C39!important;
  color: #CE3C39!important;
&:active {
   border-color: rgba(206, 60, 57, 0.6)!important;
   color: rgba(206, 60, 57, 0.6)!important;
   background-color: transparent;
 }
}
</style>
