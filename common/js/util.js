
export default {
  getComboNameByValue: function (comboValue, value) {
    if (comboValue !== undefined && comboValue.length > 0) {
      for (var i = 0; i < comboValue.length; i++) {
        if (comboValue[i].code === value) {
          return comboValue[i].name
        }
      }
    }
    return ''
  },
  getCookie: function (objName) {
    // 获取指定名称的cookie的值
    var arrStr = document.cookie.split('; ')
    for (var i = 0; i < arrStr.length; i++) {
      var temp = arrStr[i].split('=')
      if (temp[0] === objName) return unescape(temp[1])
    }
    return ''
  },
  // 设置cookie的值
  setCookie: function (cname, cvalue, exdays) {
    var d = new Date()
    console.log(cname + '/' + cvalue + '/' + exdays)
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000))
    var expires = 'expires=' + d.toGMTString()
    document.cookie = cname + '=' + escape(cvalue) + '; ' + expires
    console.log(document.cookie)
  },
  errorCallBack: function (data, router) {
    if (data.response.status === 401) {
      localStorage.setItem('skipToUrl', router.currentRoute.path)
      localStorage.setItem('query', JSON.stringify(router.currentRoute.query))
      router.push({ path: '/login' })
    }
  }
}
