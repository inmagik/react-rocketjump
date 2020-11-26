import rj from '../rj'
import rjPlugin from '../rjPlugin'

describe('Rocketjump selectors', () => {
  const mockState = {
    root: {
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
    },
  }

  it('should be getData, isLoading, getError, getRoot', () => {
    const obj = rj({
      effect: () => Promise.resolve(1),
    })
    const selectors = obj.makeSelectors()

    expect(selectors.getRoot(mockState)).toBe(mockState.root)
    expect(selectors.isLoading(mockState)).toBe(false)
    expect(selectors.isPending(mockState)).toBe(false)
    expect(selectors.getError(mockState)).toBe(mockState.root.error)
    expect(selectors.getData(mockState)).toBe(mockState.root.data)
  })

  it('should be proxable and extendible', () => {
    const obj = rj({
      effect: () => Promise.resolve(1),
      selectors: ({ getData }) => ({
        getData: (state) =>
          getData(state).map((s: any) => ({
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
    const selectors = obj.makeSelectors()

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
    const rjIsAlive = rjPlugin({
      selectors: ({ getData }) => ({
        getData: (state) =>
          getData(state).map((s: any) => ({
            ...s,
            isAlive: s.age < 27,
          })),
      }),
    })

    const capitalize = (s: string) =>
      s.slice(0, 1).toUpperCase() + s.slice(1).toLowerCase()

    const rjRangerName = rjPlugin({
      selectors: ({ getData }) => ({
        getData: (state) =>
          getData(state).map((s: any) => ({
            ...s,
            rangerName: [s.name.slice(0, -2), s.name.slice(-2)]
              .map(capitalize)
              .join(' '),
          })),
      }),
    })

    const rjPoliteRanger = rjPlugin(rjIsAlive, rjRangerName, {
      selectors: ({ getData }) => ({
        getData: (state) =>
          getData(state).map((s: any) => ({
            ...s,
            hello: `My name is ${s.rangerName} an i am ${s.age}`,
          })),
      }),
    })

    const obj = rj(rjPoliteRanger, {
      effect: () => Promise.resolve(1),
      selectors: ({ getData }) => ({
        getData: (state) =>
          getData(state).map((s: any) => ({
            ...s,
            hello: s.isAlive
              ? `${s.hello} and i am alive`
              : `${s.hello} and i am a ghost`,
          })),
      }),
    })
    const selectors = obj.makeSelectors()

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
