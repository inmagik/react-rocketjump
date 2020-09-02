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
            updater: (a) => a,
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
          thisActiontIsCool: () => ({}),
        }),
        effect: () => Promise.resolve(1312),
      })
    }).not.toThrowError()
  })
  it('should get angry when mutations is not defined along with effect', () => {
    expect(() => {
      rj({
        mutations: {
          giova: {
            effect: () => Promise.resolve(1312),
            updater: () => {},
          },
        },
      })
    }).toThrowError()

    expect(() => {
      rj(
        {
          mutations: {
            rinne: {
              effect: () => Promise.resolve(1312),
              updater: () => {},
            },
          },
        },
        {
          mutations: {
            giova: {
              effect: () => Promise.resolve(1312),
              updater: () => {},
            },
          },
          effect: () => {},
        }
      )
    }).toThrowError()

    expect(() => {
      rj(
        rj({
          mutations: {
            rinne: {
              effect: () => Promise.resolve(1312),
              updater: () => {},
            },
          },
        }),
        {
          mutations: {
            giova: {
              effect: () => Promise.resolve(1312),
              updater: () => {},
            },
          },
          effect: () => {},
        }
      )
    }).toThrowError()
  })
})
