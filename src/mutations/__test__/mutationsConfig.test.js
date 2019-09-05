import rj from '../../rj'

describe('RJ mutations config', () => {
  it('should be an object contains at least state and updater', () => {
    expect(() => {
      rj({
        mutations: {
          giova: {},
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError(/\[react-rocketjump\] @mutations/)

    expect(() => {
      rj({
        mutations: {
          giova: {
            updater: a => a,
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError(/\[react-rocketjump\] @mutations/)

    expect(() => {
      rj({
        mutations: {
          giova: {
            effect: a => a,
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError(/\[react-rocketjump\] @mutations/)

    expect(() => {
      rj({
        mutations: {
          giova: {
            effect: a => a,
            updater: a => a,
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).not.toThrowError()

    expect(() => {
      rj({
        mutations: {},
        effect: () => Promise.resolve(1312),
      })
    }).not.toThrowError()
  })
})
