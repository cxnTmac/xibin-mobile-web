import axios from 'axios'
// export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const changeLocByAlloc = params => { return axios.get(`/xibin/inventory/changeLocByAlloc`, { params: params }); }



