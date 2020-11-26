import {
  takeEffectLatest,
  takeEffectEvery,
  takeEffectExhaust,
  takeEffectConcatLatest,
  takeEffectGroupBy,
  takeEffectGroupByExhaust,
  takeEffectGroupByConcatLatest,
} from './takeEffectsHandlers'

export const TAKE_EFFECT_LATEST = 'latest'

export const TAKE_EFFECT_EVERY = 'every'

export const TAKE_EFFECT_EXHAUST = 'exhaust'

export const TAKE_EFFECT_CONCAT_LATEST = 'concatLatest'

export const TAKE_EFFECT_GROUP_BY = 'groupBy'

export const TAKE_EFFECT_GROUP_BY_EXHAUST = 'groupByExhaust'

export const TAKE_EFFECT_GROUP_BY_CONCAT_LATEST = 'groupByConcatLatest'

const takeEffectsHanlders = {
  [TAKE_EFFECT_LATEST]: takeEffectLatest,
  [TAKE_EFFECT_EVERY]: takeEffectEvery,
  [TAKE_EFFECT_EXHAUST]: takeEffectExhaust,
  [TAKE_EFFECT_CONCAT_LATEST]: takeEffectConcatLatest,
  [TAKE_EFFECT_GROUP_BY]: takeEffectGroupBy,
  [TAKE_EFFECT_GROUP_BY_EXHAUST]: takeEffectGroupByExhaust,
  [TAKE_EFFECT_GROUP_BY_CONCAT_LATEST]: takeEffectGroupByConcatLatest,
}

export default takeEffectsHanlders
