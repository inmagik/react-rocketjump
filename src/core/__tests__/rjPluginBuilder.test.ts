import { INIT } from '../actions/actionTypes'
import bindActionCreators from '../actions/bindActionCreators'
import rj from '../rj'
import rjPlugin from '../rjPlugin'
import { createTestRjEffectDispatcher } from '../testUtils'

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

    it('Should build plugin with root reducer using composeReducer', () => {
      const pp = rjPlugin()
        .reducer(() => () => true)
        .build()

      const p = rjPlugin()
        .plugins(pp)
        .composeReducer((x) => ({
          dragone: !x,
          giova: ['Hey'],
        }))
        .build()

      const obj = rj()
        .plugins(p)
        .effect(() => Promise.reject())

      expect(obj.reducer(undefined, { type: INIT }).root.dragone).toBe(false)
      expect(obj.reducer(undefined, { type: INIT }).root.giova).toEqual(['Hey'])
    })
  })
  describe('Selectors', () => {
    it('should build plugin with selectors', () => {
      const p1 = rjPlugin()
        .combineReducers({
          drago: () => 99,
          now: () => new Date('2001'),
        })
        .selectors(() => ({
          echo: () => 'echo',
        }))
        .build()

      const p = rjPlugin()
        .plugins(p1)
        .combineReducers({
          miao: () => ({ name: 'Gio Va' }),
        })
        .selectors((s) => ({
          proxy: () => s.echo().toUpperCase(),
          j3: (state) => state.drago,
          ju: (state) => state.now.getFullYear(),
          jj: (state) => state.miao.name,
        }))
        .build()

      const obj = rj()
        .plugins(p)
        .effect(() => Promise.reject())
      const state = obj.reducer(undefined, { type: INIT })

      const sel = obj.makeSelectors()

      const d: number = sel.ju(state)
      const n: number = sel.j3(state)
      const s: string = sel.jj(state)

      expect(d).toBe(2001)
      expect(n).toBe(99)
      expect(s).toBe('Gio Va')

      expect(sel.proxy()).toBe('ECHO')
    })
  })

  describe('Action creators', () => {
    it('should build plugin with action creators', () => {
      const p1 = rjPlugin()
        .actions(() => ({
          hello: () => ({ type: '$', x: 99 }),
        }))
        .build()

      const p = rjPlugin()
        .plugins(p1)
        .actions((a) => ({
          hello2x: () => ({
            ...a.hello(),
            x: a.hello().x + 1,
          }),
        }))
        .build()

      const obj = rj()
        .plugins(p)
        .effect(() => Promise.reject())

      expect(obj.actionCreators.hello2x()).toEqual({
        type: '$',
        x: 100,
      })
    })
  })

  describe('Side effect', () => {
    it('should build plugin with side effect config', async () => {
      const fakeCaller = jest.fn().mockResolvedValue('~')

      const p = rjPlugin()
        .effect({
          effectCaller: fakeCaller,
        })
        .build()

      const obj = rj()
        .plugins(p)
        .effect(() => Promise.reject())

      const mockCb = jest.fn()
      const dispatch = createTestRjEffectDispatcher(obj, mockCb)
      const actions = bindActionCreators(obj.actionCreators, dispatch)

      actions.run()

      await fakeCaller.mock.results[0].value

      expect(mockCb.mock.calls[2][0].payload.data).toBe('~')
    })
  })
})
