import axios from 'axios'
// export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const getOutboundAllocListPage = params => { return axios.get(`/xibin/outbound/showAllOutboundAlloc.shtml`, { params: params }) }

export const getOutboundDetailListPage = params => { return axios.get(`/xibin/outbound/showAllOutboundDetail.shtml`, { params: params }) }

export const pick = params => { return axios.get(`/xibin/outbound/pickByAlloc.shtml`, { params: params }) }

export const cancelPick = params => { return axios.get(`/xibin/outbound/cancelPickByAlloc.shtml`, { params: params }) }

export const getOutboundOrderListPage = params => { return axios.get(`/xibin/outbound/showAllOutboundOrder.shtml`, { params: params }) }

export const shipByHeader = params => { return axios.get(`/xibin/outbound/shipByHeader.shtml`, { params: params }) }

export const cancelShipByHeader = params => { return axios.get(`/xibin/outbound/cancelShipByHeader.shtml`, { params: params }) }

