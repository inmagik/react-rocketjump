import { INIT } from '../actions/actionTypes'
import rj from '../rj'
import rjPlugin from '../rjPlugin'

describe('RjPlugin Builder', () => {
  describe('Root Reducer', () => {
    it('Should build plugin with root reducer', () => {
      const p = rjPlugin()
        .reducer(() => () => new Date('1999'))
        .build()

      const obj = rj()
        .plugins(p)
        .effect(() => Promise.reject())

      expect(obj.reducer(undefined, { type: INIT }).root.getFullYear()).toBe(
        1999
      )
    })

    it('Should build plugin with root reducer and have access to parent plugins', () => {
      const pp = rjPlugin()
        .reducer(() => () => true)
        .build()

      const p = rjPlugin()
        .plugins(pp)
        .reducer((r) => (s, a) => ({ d: new Date('1999'), v: r() }))
        .build()

      const obj = rj()
        .plugins(p)
        .effect(() => Promise.reject())

      expect(obj.reducer(undefined, { type: INIT }).root.d.getFullYear()).toBe(
        1999
      )
      expect(obj.reducer(undefined, { type: INIT }).root.v).toBe(true)
    })
  })
})
