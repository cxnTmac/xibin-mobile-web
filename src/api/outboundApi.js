import axios from 'axios'
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

