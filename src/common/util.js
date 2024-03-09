var SIGN_REGEXP = /([yMdhsm])(\1*)/g;
var DEFAULT_PATTERN = "yyyy-MM-dd";
// import ElementUI from 'element-ui';
import Vue from "vue";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
function padding(s, len) {
  var len = len - (s + "").length;
  for (var i = 0; i < len; i++) {
    s = "0" + s;
  }
  return s;
}
export default {
   syncHandle:function(func) {
    let timer = setTimeout(async () => {
      await func();
      clearTimeout(timer);
    }, 0);
  },
  getUrlParams: function(url) {
    const reg = /(\w+)=([^&]+)/g;
    const params = {};
    let match;
    while ((match = reg.exec(url)) !== null) {
      params[match[1]] = match[2];
    }
    return params;
  },
  base64ToBlob: function(dataurl) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  },
  getQueryStringByName: function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    var context = "";
    if (r != null) context = r[2];
    reg = null;
    r = null;
    return context == null || context == "" || context == "undefined"
      ? ""
      : context;
  },
  getComboNameByValue: function (comboValue, value) {
    if (comboValue !== undefined && comboValue.length > 0) {
      for (var i = 0; i < comboValue.length; i++) {
        if (comboValue[i].code === value) {
          return comboValue[i].name;
        }
      }
    }
    return "";
  },
  arrayToString: function (array) {
    let result = "";
    for (let i = 0; i < array.length; i++) {
      if (i !== array.length - 1) {
        result += array[i] + ",";
      } else {
        result += array[i];
      }
    }
    return result;
  },
  reLogin: function () {
    Vue.loginPopWin();
  },
  errorCallBack: function (data, router, $message) {
    if (data.response !== undefined) {
      if (data.response.status == 401) {
        Vue.loginPopWin();
      }
    } else {
      alert(data.message);
    }
  },

  /* ===== 浮点型数据的加、减、乘、除 ===== */
  add: function (arg1, arg2) {
    // 加法
    let r1, r2, m;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    return (arg1 * m + arg2 * m) / m;
  },

  sub: function (arg1, arg2) {
    // 减法
    let r1, r2, m, n;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    n = r1 >= r2 ? r1 : r2;
    return ((arg1 * m - arg2 * m) / m).toFixed(n);
  },

  mul: function (arg1, arg2) {
    // 乘法
    let m = 0;
    let s1 = arg1.toString();
    let s2 = arg2.toString();
    try {
      m += s1.split(".")[1].length;
    } catch (e) { }
    try {
      m += s2.split(".")[1].length;
    } catch (e) { }
    return (
      (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) /
      Math.pow(10, m)
    );
  },
  div: function (arg1, arg2) {
    // 除法
    let t1 = 0;
    let t2 = 0;
    let r1;
    let r2;
    try {
      t1 = arg1.toString().split(".")[1].length;
    } catch (e) { }
    try {
      t2 = arg2.toString().split(".")[1].length;
    } catch (e) { }
    r1 = Number(arg1.toString().replace(".", ""));
    r2 = Number(arg2.toString().replace(".", ""));
    let intDiv = r1 / r2;
    let pow = Math.pow(10, t2 - t1);
    return mul(intDiv, pow); // 这里用上面定义好的乘法运算
  },

  isNullOrUndefined: function (value) {
    if (value === undefined || value === null) {
      return true;
    } else {
      return false;
    }
  },
  formatDate: {
    format: function (date, pattern) {
      pattern = pattern || DEFAULT_PATTERN;
      return pattern.replace(SIGN_REGEXP, function ($0) {
        switch ($0.charAt(0)) {
          case "y":
            return padding(date.getFullYear(), $0.length);
          case "M":
            return padding(date.getMonth() + 1, $0.length);
          case "d":
            return padding(date.getDate(), $0.length);
          case "w":
            return date.getDay() + 1;
          case "h":
            return padding(date.getHours(), $0.length);
          case "m":
            return padding(date.getMinutes(), $0.length);
          case "s":
            return padding(date.getSeconds(), $0.length);
        }
      });
    },
    parse: function (dateString, pattern) {
      var matchs1 = pattern.match(SIGN_REGEXP);
      var matchs2 = dateString.match(/(\d)+/g);
      if (matchs2.length > 6) {
        matchs2.splice(6, matchs2.length - 1);
      }
      if (matchs1.length == matchs2.length) {
        var _date = new Date(1970, 0, 1);
        for (var i = 0; i < matchs1.length; i++) {
          var _int = parseInt(matchs2[i]);
          var sign = matchs1[i];
          switch (sign.charAt(0)) {
            case "y":
              _date.setFullYear(_int);
              break;
            case "M":
              _date.setMonth(_int - 1);
              break;
            case "d":
              _date.setDate(_int);
              break;
            case "h":
              _date.setHours(_int);
              break;
            case "m":
              _date.setMinutes(_int);
              break;
            case "s":
              _date.setSeconds(_int);
              break;
          }
        }
        return _date;
      }
      return null;
    },
  },
};
