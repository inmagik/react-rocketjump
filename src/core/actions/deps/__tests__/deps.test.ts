import { maybe, withMeta, maybeGet } from '../deps'
import { getMetaFromDeps, getRunValuesFromDeps, shouldRunDeps } from '../funcs'

describe('deps', () => {
  it('should squash values', () => {
    expect(getMetaFromDeps([23, 'Giova', { name: 'Mia' }])).toEqual({})

    expect(
      getMetaFromDeps([
        23,
        'Giova',
        withMeta(23, { name: 'Mia' }),
        maybe(false).withMeta({ giova: 23 }),
        maybe(23).withMeta({ giova: 'King' }),
      ])
    ).toEqual({
      name: 'Mia',
      giova: 'King',
    })
  })

  it('should squash values', () => {
    expect(
      getRunValuesFromDeps([23, 99, { name: 'Giova' }, ['Un', 'Dos', 'Tres']])
    ).toEqual([23, 99, { name: 'Giova' }, ['Un', 'Dos', 'Tres']])

    expect(
      getRunValuesFromDeps([
        23,
        maybe(false),
        maybeGet({ name: 'GioVa' }, 'name'),
        maybeGet(0, 'name'),
      ])
    ).toEqual([23, false, 'GioVa', 0])

    expect(getRunValuesFromDeps([maybe(maybe(maybe(maybe(23))))])).toEqual([23])
  })

  it('should determinate if can run', () => {
    expect(
      shouldRunDeps([23, 99, { name: 'Giova' }, ['Un', 'Dos', 'Tres']])
    ).toEqual(true)

    expect(
      shouldRunDeps([
        23,
        maybe(false),
        maybeGet({ name: 'GioVa' }, 'name'),
        maybeGet(0, 'name'),
      ])
    ).toEqual(false)

    expect(shouldRunDeps([maybe(maybe(maybe(maybe(23))))])).toEqual(true)
  })
})
