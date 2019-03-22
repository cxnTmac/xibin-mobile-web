import axios from 'axios'
// export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const getFittingModelList = params => { return axios.get(`/xibin/model/MshowAllModel.shtml`, { params: params }) }

