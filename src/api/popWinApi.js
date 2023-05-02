import axios from 'axios';
var qs = require('qs');
let base = '';


// export const requestLogin = params => { return axios.post(`/xibin/user/login`,qs.stringify(params),{headers: {
//     'Content-Type': 'application/x-www-form-urlencoded',
// }} ).then(res => res.data); };
export const query = params => { return axios.get(`/xibin/popWin/query`, { params: params }); };


