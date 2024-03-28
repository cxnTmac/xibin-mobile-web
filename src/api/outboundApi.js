import axios from 'axios'
var qs = require('qs');
// export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const getOutboundAllocListPage = params => { return axios.get(`/xibin/outbound/showAllOutboundAlloc`, { params: params }) }

export const getOutboundDetailListPage = params => { return axios.get(`/xibin/outbound/showAllOutboundDetail`, { params: params }) }

export const pick = params => { return axios.get(`/xibin/outbound/pickByAlloc`, { params: params }) }

export const createAssembleByDetails = params => { return axios.get(`/xibin/outbound/createAssembleByDetails`, { params: params }) }

export const createCrossDockInboundByDetails = params => { return axios.get(`/xibin/outbound/createCrossDockInboundByDetails`, { params: params }) }

export const cancelPick = params => { return axios.get(`/xibin/outbound/cancelPickByAlloc`, { params: params }) }

export const getOutboundOrderListPage = params => { return axios.get(`/xibin/outbound/showAllOutboundOrder`, { params: params }) }

export const shipByHeader = params => { return axios.get(`/xibin/outbound/shipByHeader`, { params: params }) }

export const cancelShipByHeader = params => { return axios.get(`/xibin/outbound/cancelShipByHeader`, { params: params }) }

export const cancelAlloc = params => { return axios.get(`/xibin/outbound/cancelAlloc`, { params: params }) }

export const saveOutboundDetail = params => { return axios.get(`/xibin/outbound/saveOutboundDetail`, { params: params }); }

export const alloc = params => { return axios.get(`/xibin/outbound/alloc`, { params: params }); }

export const virtualAlloc = params => { return axios.get(`/xibin/outbound/virtualAlloc`, { params: params }); }

export const pack = params => { return axios.get(`/xibin/outbound/packByAlloc`, { params: params }); }

export const cancelPack = params => { return axios.get(`/xibin/outbound/cancelPackByAlloc`, { params: params }); }

export const getTotalPackageNumByOrderNo = params => { return axios.get(`/xibin/outbound/getTotalPackageNumByOrderNo`, { params: params }); }

export const saveOutboundOrder = params => { return axios.get(`/xibin/outbound/saveOutboundOrder`, { params: params }); }
export const selectForMobileAlloc = params => { return axios.get(`/xibin/outbound/selectForMobileAlloc`, { params: params }); }

export const removeOutboundDetail = params => { return axios.post(`/xibin/outbound/removeOutboundDetail`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };

export const mobileScanSaveOutboundDetail = params => { return axios.get(`/xibin/outbound/mobileScanSaveOutboundDetail`, { params: params }); }

export const updateSkuPackageCode = params => { return axios.get(`/xibin/fittingSku/updateSkuPackageCode`, { params: params }); };


