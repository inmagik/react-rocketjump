import rj from '../rj'
import { isObjectRj as strictIsObjectRj } from '../types'
import { isPartialRj, isObjectRj, forgeRocketJump } from 'rocketjump-core'

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
  it('should get angry when invoke with shit', () => {
    expect(() => {
      rj(23)
    }).toThrowError(
      /\[react-rocketjump\] you can pass only config object or rj partial to rj constructor/
    )
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
      /\[react-rocketjump\] effect should be defined only once, in the last argument/
    )
    expect(() => {
      rj(
        () => 23,
        () => 777
      )
    }).toThrowError(
      /\[react-rocketjump\] effect should be defined only once, in the last argument/
    )
    expect(() => {
      rj(
        rj({
          effect: () => 23,
        })
      )
    }).toThrowError(
      /\[react-rocketjump\] you can't pass an rj object as argument./
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
      /\[react-rocketjump\] effect should be defined only once, in the last argument/
    )
    expect(() => {
      rj(() => 23, {
        effect: () => 23,
      })
    }).toThrowError(/\[react-rocketjump\] ./)
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
      rj(
        rj(() => 23),
        {
          reducer: r => r,
        }
      )()
    }).toThrowError(
      /\[react-rocketjump\] you can't pass an rj object as argument./
    )
  })

  it('should have strict isObjectRj', () => {
    const dubRj = forgeRocketJump({
      mark: Symbol('DUB'),
      shouldRocketJump: () => true, // single invocation
      makeRunConfig: () => null, // no run config
      makeRecursionRjs: rjs => rjs, // don't touch configs
      makeExport: (_, config, rjExport = {}) => {
        return {
          giova: 23,
        }
      },
      finalizeExport: rjExport => ({ ...rjExport }), // don't hack config
    })

    expect(strictIsObjectRj(dubRj())).toBe(false)
    expect(isObjectRj(dubRj())).toBe(true)

    expect(strictIsObjectRj(rj(() => 2))).toBe(true)
    expect(isObjectRj(rj(() => 2))).toBe(true)
  })
})
