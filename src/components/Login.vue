<template>
  <div>
    <div class="vux-demo">
      <img class="logo" src="../../static/logo/LOGO3.jpg">
    </div>
    <group title="登陆" labelAlign="left" labelWidth="80px">
      <x-input title="用户名" type="text" v-model="user.userName" :required="true"></x-input>
      <x-input title="密码" type="password" v-model="user.password" :required="true"></x-input>
      <x-button type="primary" @click.native="handleLogin">登陆</x-button>
      <x-button type="warn">重置</x-button>
      <x-button type="primary" @click.native="handleWXLogin">微信登陆</x-button>
    </group>
  </div>
</template>

<script>
import { Toast, Group, Cell, XInput, XButton, Alert, AlertPlugin, Grid, GridItem } from 'vux'
import { wxLogin, requestLogin } from '../api/sysApi'
import util from '../../common/js/util'
import Vue from 'vue'
Vue.use(AlertPlugin)
export default {
  components: {
    Toast,
    Group,
    Cell,
    XInput,
    XButton,
    Alert,
    AlertPlugin,
    Grid,
    GridItem
  },
  data() {
    return {
      // note: changing this line won't causes changes
      // with hot-reload because the reloaded component
      // preserves its current state and we are modifying
      // its initial state.
      user: { userName: '', password: '' }
    }
  },
  mounted() {
    this.user = { userName: localStorage.getItem('userName'), password: localStorage.getItem('password') };
    let skipToUrl = localStorage.getItem('skipToUrl')
    // if (skipToUrl !== '' && skipToUrl !== null && skipToUrl !== '/') {
    //   this.$vux.toast.text('登陆信息已超时，请重新登陆', 'buttom')
    // }
    let currentUrl = window.location.href;
    let index1 = currentUrl.indexOf('?');
    let index2 = currentUrl.indexOf('&');
    let paramStr = currentUrl.substring(index1 + 1, index2);
    let code = paramStr.split('=')[1];
    console.log(code);
    if (code !== null && code !== "" && code !== undefined) {
      wxLogin({ code: code }).then((resdata) => {
        console.log(resdata)
        let { msg, code, data } = resdata
        if (code !== 200) {
          this.$vux.alert.show({
            title: '登陆失败',
            content: msg
          });
        } else {
          // util.setCookie('user', JSON.stringify(data), 1)
          let userData = JSON.stringify(data)
          // 设置过期时间
          let overTime = new Date().getTime() + 28800000
          localStorage.setItem('user', userData)
          localStorage.setItem('overTime', overTime)
          let skipToUrl = sessionStorage.getItem('skipToUrl')
          let query = sessionStorage.getItem('query')
          if (skipToUrl !== '' && skipToUrl !== null && skipToUrl !== '/') {
            this.$router.push({ path: skipToUrl, query: JSON.parse(query) })
          } else {
            this.$router.push({ path: '/Menu' })
          }
        }
      }).catch((data) => {
        alert(data)
        this.$router.push({ path: '/login' })
      });
    }
  },
  methods: {
    handleWXLogin: function () {
      window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxce961a786a558fb8&redirect_uri=http://www.jjxbjg.com/xibin-mobile&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect";

      // wxLogin({ code: '061ndCll2wnn7d47Jhll2Unpp64ndClX' }).then((resdata) => {
      //   console.log(resdata)
      //   let { msg, code, data } = resdata
      //   if (code !== 200) {
      //     this.$vux.alert.show({
      //       title: '登陆失败',
      //       content: msg,
      //       onShow() {

      //       },
      //       onHide() {

      //       }
      //     })
      //   } else {
      //     // util.setCookie('user', JSON.stringify(data), 1)
      //     let userData = JSON.stringify(data)
      //     // 设置过期时间
      //     let overTime = new Date().getTime() + 28800000
      //     localStorage.setItem('user', userData)
      //     localStorage.setItem('overTime', overTime)
      //     let skipToUrl = sessionStorage.getItem('skipToUrl')
      //     let query = sessionStorage.getItem('query')
      //     if (skipToUrl !== '' && skipToUrl !== null && skipToUrl !== '/') {
      //       this.$router.push({ path: skipToUrl, query: JSON.parse(query) })
      //     } else {
      //       this.$router.push({ path: '/Menu' })
      //     }
      //   }
      // }).catch((data) => {
      //   alert(data)
      // });
    },
    handleLogin: function () {
      let loginParams = { username: this.user.userName, password: this.user.password };
      requestLogin(loginParams).then(resdata => {
        let { msg, code, data } = resdata
        if (code !== 200) {
          this.$vux.alert.show({
            title: '登陆失败',
            content: msg
          });
        } else {
          // util.setCookie('user', JSON.stringify(data), 1)
          let userData = JSON.stringify(data)
          // 设置过期时间
          let overTime = new Date().getTime() + 60 * 60 * 1000
          localStorage.setItem('user', userData)
          localStorage.setItem('overTime', overTime)
          localStorage.setItem('userName', this.user.userName)
          localStorage.setItem('password', this.user.password)
          let skipToUrl = sessionStorage.getItem('skipToUrl')
          let query = sessionStorage.getItem('query')
          if (skipToUrl !== '' && skipToUrl !== null && skipToUrl !== '/') {
            this.$router.push({ path: skipToUrl, query: JSON.parse(query) })
          } else {
            this.$router.push({ path: '/Menu' })
          }
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
  margin-top: 20%;
  margin-bottom: 40%;
  width: 217px;
  height: 46px
}

.custom-primary-blue {
  border-radius: 5px !important;
  border-color: #1413ce !important;
  color: #1413ce !important;

  &:active {
    border-color: rgba(7, 94, 206, 0.6) !important;
    color: rgba(7, 94, 206, 0.6) !important;
    background-color: transparent;
  }
}

.custom-primary-red {
  border-radius: 5px !important;
  border-color: #CE3C39 !important;
  color: #CE3C39 !important;

  &:active {
    border-color: rgba(206, 60, 57, 0.6) !important;
    color: rgba(206, 60, 57, 0.6) !important;
    background-color: transparent;
  }
}
</style>
