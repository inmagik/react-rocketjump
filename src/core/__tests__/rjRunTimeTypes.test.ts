import { isObjectRj, isPluginRj } from '../typeUtils'
import rj from '../rj'
import rjPlugin from '../rjPlugin'

describe('Rj Run Time Types', () => {
  it('should detect an RjObject at runtime with isObjectRj', () => {
    expect(isObjectRj(88)).toBe(false)
    expect(
      isObjectRj({
        reducer: () => 99,
      })
    ).toBe(false)
    expect(
      isObjectRj({
        reducer: () => 99,
      })
    ).toBe(false)
    expect(isObjectRj(rjPlugin())).toBe(false)
    expect(
      isObjectRj(
        rj({
          effect: () => Promise.resolve(88),
        })
      )
    ).toBe(true)
  })
  it('should detect an RjPlugin at runtime with isPluginRj', () => {
    expect(isPluginRj(88)).toBe(false)
    expect(
      isPluginRj({
        reducer: () => 99,
      })
    ).toBe(false)
    expect(
      isObjectRj({
        reducer: () => 99,
      })
    ).toBe(false)
    expect(isPluginRj(rjPlugin().build())).toBe(true)
    expect(isPluginRj(rjPlugin({
      takeEffect: 'every',
    }))).toBe(true)
    expect(
      isPluginRj(
        rj({
          effect: () => Promise.resolve(88),
        })
      )
    ).toBe(false)
  })
})
