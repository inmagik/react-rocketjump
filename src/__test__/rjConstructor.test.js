import rj from '../rj'
import { isPartialRj, isObjectRj } from 'rocketjump-core'

describe('rj constructor', () => {
  it('should produce rj object when called with effect or a function', () => {
    expect(isObjectRj(rj(() => 23))).toBe(true)
    expect(
      isObjectRj(
        rj({
          effect: () => 23,
        })
      )
    ).toBe(true)
    expect(
      isObjectRj(
        rj(
          {
            reducer: r => r,
          },
          {
            effect: () => 23,
          }
        )
      )
    ).toBe(true)
    expect(
      isObjectRj(
        rj(
          rj({
            reducer: r => r,
          }),
          {
            effect: () => 23,
          }
        )
      )
    ).toBe(true)
  })
  it('should get angry with the function are both in config and not last args', () => {
    expect(() => {
      rj(
        {
          effect: () => 23,
        },
        {
          reducer: r => r,
        }
      )
    }).toThrowError(
      /\[react-rocketjump\] effect should defined one time at last/
    )
    expect(() => {
      rj(
        rj({
          effect: () => 23,
        })
      )
    }).toThrowError(
      /\[react-rocketjump\] you can pass an rj object as argument./
    )
    expect(() => {
      rj(
        {
          effect: () => 23,
        },
        {
          effect: () => 23,
        }
      )
    }).toThrowError(
      /\[react-rocketjump\] effect should defined one time at last/
    )
    expect(() => {
      rj(() => 23, {
        effect: () => 23,
      })
    }).toThrowError(
      /\[react-rocketjump\] effect should defined one time at last/
    )
  })
  it('should produce rj partial no effect or function is provided', () => {
    expect(isPartialRj(rj())).toBe(true)
    expect(
      isPartialRj(
        rj({
          reducer: r => r,
        })
      )
    ).toBe(true)

    expect(isPartialRj(rj(rj()))).toBe(true)

    expect(isPartialRj(rj(() => 23))).toBe(false)
  })
  it('should not permit the last invocation NEVER', () => {
    expect(() => {
      rj()()
    }).toThrowError(/\[react-rocketjump\] you can't invoke a partialRj/)

    expect(() => {
      rj(() => 23)()
    }).toThrow()

    expect(() => {
      rj({
        reducer: r => r,
      })()
    }).toThrowError(/\[react-rocketjump\] you can't invoke a partialRj/)

    expect(() => {
      rj(rj(() => 23), {
        reducer: r => r,
      })()
    }).toThrowError(
      /\[react-rocketjump\] you can pass an rj object as argument/
    )
  })
})
