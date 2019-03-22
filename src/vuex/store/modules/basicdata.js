const state = {
  fittingType: {},
  fittingSkuCode: '',
  fuzzyCondition: ''
}
const mutations = {
  changeType (state, newFittingType) {
    state.fittingType = newFittingType
  },
  changeSkuCode (state, newFittingSkuCode) {
    state.fittingSkuCode = newFittingSkuCode
  },
  changeFuzzyCondition (state, newFuzzyCondition) {
    state.fuzzyCondition = newFuzzyCondition
  }
}
export default {
  state,
  mutations
}
