import axios from 'axios'
var qs = require('qs')

// export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const requestLogin = params => {
  return axios.post(`/xibin/user/login.shtml`, qs.stringify(params), {headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }}).then(res => res.data)
}
export const logout = params => {
  return axios.post(`/xibin/user/logout.shtml`, {}, {headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }}).then(res => res.data)
}

export const requestAccessToken = params => {
  return axios.post(`/xibin/wxApi/getAccessToken.shtml`, qs.stringify(params), {headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  }}).then(res => res.data)
}

export const wxLogin = params => { return axios.get(`/xibin/wx/getAccessTokenForLogin.shtml`, { params: params }); };

