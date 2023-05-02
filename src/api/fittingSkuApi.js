import axios from 'axios'
// export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const getFittingSkuListPage = params => { return axios.get(`/xibin/fittingSku/MshowAllFittingSku`, { params: params }) }

export const getFittingSkuBySkuCode = params => { return axios.get(`/xibin/fittingSku/getFittingTypeSkuBySkuCode`, { params: params }) }

export const getFittingSkuPicBySkuCode = params => { return axios.get(`/xibin/fittingSku/getFittingSkuPic`, { params: params }) }
