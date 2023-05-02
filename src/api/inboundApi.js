/**
 * Created by cxn on 2017/5/19.
 */
import axios from 'axios';
var qs = require('qs');
let base = '';

// export const requestLogin = params => { return axios.post(`${base}/login`, params).then(res => res.data); };

export const getInboundOrderListPage = params => { return axios.get(`/xibin/inbound/showAllInboundOrder`, { params: params }); };

export const getInboundDetailListPage = params => { return axios.get(`/xibin/inbound/showAllInboundDetail`, { params: params }); };

export const showAllClosedOrderInboundDetail = params => { return axios.get(`/xibin/inbound/showAllClosedOrderInboundDetail`, { params: params }); };

export const getInboundRecListPage = params => { return axios.get(`/xibin/inbound/showAllInboundRecieve`, { params: params }); };
// export const removeFittingSku = params => { return axios.get(`/xibin/fittingSku/removeFittingSku `, { params: params }); };
//
export const removeInboundDetail = params => { return axios.post(`/xibin/inbound/removeInboundDetail`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };

export const remove = params => { return axios.post(`/xibin/inbound/remove`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };

export const audit = params => { return axios.post(`/xibin/inbound/audit`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };

export const close = params => { return axios.post(`/xibin/inbound/close`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };

export const createVoucher = params => { return axios.post(`/xibin/inbound/createVoucher`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };

export const cancelAudit = params => { return axios.post(`/xibin/inbound/cancelAudit`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };
//
export const saveInboundOrder = params => { return axios.get(`/xibin/inbound/saveInboundOrder`, { params: params }); };

export const saveInboundDetail = params => { return axios.get(`/xibin/inbound/saveInboundDetail`, { params: params }); };

export const receive = params => { return axios.get(`/xibin/inbound/receive`, { params: params }); };

export const batchReceive = params => { return axios.post(`/xibin/inbound/batchReceive`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };

export const cancelReceive = params => { return axios.get(`/xibin/inbound/cancelReceive`, { params: params }); };
//
export const getInboundOrderHeader = params => { return axios.get(`/xibin/inbound/getInboundHeaderByOderNo`, { params: params }); };

export const accountByOrderNo = params => { return axios.get(`/xibin/inbound/accountByOrderNo`, { params: params }); };

export const accountCostByOrderNo = params => { return axios.get(`/xibin/inbound/accountCostByOrderNo`, { params: params }); };

export const accountByOrderNos = params => { return axios.post(`/xibin/inbound/accountByOrderNos`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };

export const accountCostByOrderNos = params => { return axios.post(`/xibin/inbound/accountCostByOrderNos`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };

// export const queryWmInboundDetailByPage = params => { return axios.get(`/xibin/inbound/queryWmInboundDetailByPage`, { params: params }); };
export const queryWmInboundDetailByPage = params => { return axios.post(`/xibin/inbound/queryWmInboundDetailByPage`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };

export const batchSaveInboundDetail = params => { return axios.post(`/xibin/inbound/batchSaveInboundDetail`,qs.stringify(params),{headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
}} ).then(res => res); };


export const queryHistorySale = params => { return axios.get(`/xibin/inbound/queryHistorySale`, { params: params }); };
// export const removeFittingSkuPic = params => { return axios.get(`/xibin/fittingSku/removeFittingSkuPic `, { params: params }); };

export const selectNextOrderNo = params => { return axios.get(`/xibin/inbound/selectNextOrderNo`, { params: params }); };

export const selectPreOrderNo = params => { return axios.get(`/xibin/inbound/selectPreOrderNo`, { params: params }); };

