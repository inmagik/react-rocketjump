import rj from '../../rj'

const ORIGINAL_ENV = { ...process.env }

beforeEach(() => {
  jest.resetModules()
  process.env = ORIGINAL_ENV
})

describe('RJ mutations config', () => {
  it('should be an object contains at least state and updater', () => {
    expect(() => {
      rj({
        mutations: {
          giova: {},
        } as any,
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError(/\[react-rocketjump\] @mutations/)

    expect(() => {
      rj({
        mutations: {
          giova: {
            updater: (a: any) => a,
          },
        } as any,
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError(/\[react-rocketjump\] @mutations/)

    expect(() => {
      rj({
        mutations: {
          giova: {
            effect: (a) => a,
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError(/\[react-rocketjump\] @mutations/)

    expect(() => {
      rj({
        mutations: {
          giova: {
            effect: (a) => a,
            updater: (a) => a,
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
  it("should get angry when updater don't match any action creator", () => {
    expect(() => {
      rj({
        mutations: {
          giova: {
            effect: () => Promise.resolve(1312),
            updater: 'thisActionCreatorDontExist',
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError()

    expect(() => {
      rj({
        mutations: {
          giova: {
            effect: () => Promise.resolve(1312),
            updater: 'thisActiontIsCool',
          },
        },
        actions: () => ({
          thisActiontIsCool: () => ({ type: 'J' }),
        }),
        effect: () => Promise.resolve(1312),
      })
    }).not.toThrowError()

    expect(() => {
      rj({
        mutations: {
          giova: {
            optimisticResult: () => {},
            effect: () => Promise.resolve(1312),
            optimisticUpdater: 'thisActionCreatorDontExist',
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError()

    expect(() => {
      rj({
        mutations: {
          giova: {
            optimisticResult: () => {},
            effect: () => Promise.resolve(1312),
            optimisticUpdater: 'thisActiontIsCool',
          },
        },
        actions: () => ({
          thisActiontIsCool: () => ({ type: 'J' }),
        }),
        effect: () => Promise.resolve(1312),
      })
    }).not.toThrowError()
  })
  it('should get angry when optimistiUpdater is defined without optimistiResult', () => {
    expect(() => {
      rj({
        mutations: {
          giova: {
            optimisticUpdater: () => {},
            effect: () => Promise.resolve(1312),
            updater: () => {},
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError(/\[react-rocketjump\] @mutations/)

    expect(() => {
      rj({
        mutations: {
          giova: {
            optimisticUpdater: () => {},
            effect: () => Promise.resolve(1312),
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError(/\[react-rocketjump\] @mutations/)

    expect(() => {
      rj({
        mutations: {
          giova: {
            optimisticResult: () => {},
            optimisticUpdater: () => {},
            effect: () => Promise.resolve(1312),
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).not.toThrowError()
  })

  it('should use short errors in production', () => {
    process.env.NODE_ENV = 'production'

    expect(() => {
      rj({
        mutations: {
          giova: {
            optimisticUpdater: () => {},
            effect: () => Promise.resolve(1312),
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError('[react-rocketjump] @mutations error.')

    expect(() => {
      rj({
        mutations: {
          giova: {
            optimisticResult: () => {},
            optimisticUpdater: 'fucker',
            effect: () => Promise.resolve(1312),
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError('[react-rocketjump] @mutations error.')

    expect(() => {
      rj({
        mutations: {
          giova: {
            updater: 'fucker',
            effect: () => Promise.resolve(1312),
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError('[react-rocketjump] @mutations error.')

    expect(() => {
      rj({
        mutations: {
          giova: {
            effect: () => Promise.resolve(1312),
          },
        },
        effect: () => Promise.resolve(1312),
      })
    }).toThrowError('[react-rocketjump] @mutations error.')
  })
})
