import { rj } from '..'

describe('Rocketjump selectors', () => {
  const mockState = {
    pending: false,
    error: '401 Unauthorized',
    data: [
      {
        name: 'Alice',
        age: 24,
      },
      {
        name: 'Bob',
        age: 29,
      },
    ],
  }

  const rjSelectors = (...config) => {
    return rj(...config).makeSelectors()
  }

  it('should be getData, isLoading, getError, getBaseState', () => {
    const selectors = rjSelectors({
      effect: () => Promise.resolve(1),
    })

    expect(selectors.isLoading(mockState)).toBe(mockState.pending)
    expect(selectors.isPending(mockState)).toBe(mockState.pending)
    expect(selectors.getError(mockState)).toBe(mockState.error)
    expect(selectors.getData(mockState)).toBe(mockState.data)
  })

  it('should be proxable and extendible', () => {
    const selectors = rjSelectors({
      effect: () => Promise.resolve(1),
      selectors: ({ getData }) => ({
        getData: (state) =>
          getData(state).map((s) => ({
            ...s,
            name: s.name.toUpperCase(),
            fresh: true,
          })),
        getOldest: (state) => {
          let people = [...getData(state)]
          people.sort((a, b) => b.age - a.age)
          return people[0]
        },
      }),
    })

    expect(selectors.getData(mockState)).toEqual([
      {
        name: 'ALICE',
        fresh: true,
        age: 24,
      },
      {
        name: 'BOB',
        fresh: true,
        age: 29,
      },
    ])

    expect(selectors.getOldest(mockState)).toEqual({
      name: 'Bob',
      age: 29,
    })
  })

  it('should be composable', () => {
    const rjIsAlive = rj({
      selectors: ({ getData }) => ({
        getData: (state) =>
          getData(state).map((s) => ({
            ...s,
            isAlive: s.age < 27,
          })),
      }),
    })

    const capitalize = (s) =>
      s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase()

    const rjRangerName = rj({
      selectors: ({ getData }) => ({
        getData: (state) =>
          getData(state).map((s) => ({
            ...s,
            rangerName: [s.name.slice(0, -2), s.name.slice(-2)]
              .map(capitalize)
              .join(' '),
          })),
      }),
    })

    const rjPoliteRanger = rj(rjIsAlive, rjRangerName, {
      selectors: ({ getData }) => ({
        getData: (state) =>
          getData(state).map((s) => ({
            ...s,
            hello: `My name is ${s.rangerName} an i am ${s.age}`,
          })),
      }),
    })

    const selectors = rjSelectors(rjPoliteRanger, {
      effect: () => Promise.resolve(1),
      selectors: ({ getData }) => ({
        getData: (state) =>
          getData(state).map((s) => ({
            ...s,
            hello: s.isAlive
              ? `${s.hello} and i am alive`
              : `${s.hello} and i am a ghost`,
          })),
      }),
    })

    expect(selectors.getData(mockState)).toEqual([
      {
        name: 'Alice',
        age: 24,
        isAlive: true,
        rangerName: 'Ali Ce',
        hello: 'My name is Ali Ce an i am 24 and i am alive',
      },
      {
        name: 'Bob',
        age: 29,
        isAlive: false,
        rangerName: 'B Ob',
        hello: 'My name is B Ob an i am 29 and i am a ghost',
      },
    ])
  })
})
