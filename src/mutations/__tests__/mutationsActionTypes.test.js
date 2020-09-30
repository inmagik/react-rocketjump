import { makeMutationType, matchMutationType } from '../actionTypes'
import { RUN, CLEAN, CANCEL } from '../../actionTypes'

describe('mutations action type', () => {
  it('should be generated from makeMutationType', () => {
    expect(makeMutationType('giova')).toBe('@MUTATION/giova/')
    expect(makeMutationType('giova', RUN)).toBe('@MUTATION/giova/RUN')
    expect(makeMutationType('giova', CLEAN)).toBe('@MUTATION/giova/CLEAN')
    expect(makeMutationType('rinne', CANCEL)).toBe('@MUTATION/rinne/CANCEL')
  })

  it('should be matched from matchMutationType', () => {
    expect(matchMutationType('CULO')).toBe(null)
    expect(matchMutationType('@MUTATION')).toBe(null)
    expect(matchMutationType('@MUTATION/giova/drago/23')).toBe(null)
    expect(matchMutationType('@MUTATION/giova/RUN')).toEqual(['giova', 'RUN'])

    expect(matchMutationType('@MUTATION/giova/RUN', 'rinne')).toBe(null)
    expect(matchMutationType('@MUTATION/giova/RUN', 'giova')).toEqual([
      'giova',
      'RUN',
    ])
    expect(matchMutationType('@MUTATION/giova/RUN', '*')).toEqual([
      'giova',
      'RUN',
    ])
    expect(
      matchMutationType('@MUTATION/giova/CANCEL', ['giova', 'rinne'])
    ).toEqual(['giova', 'CANCEL'])
    expect(
      matchMutationType('@MUTATION/drago/CANCEL', ['giova', 'rinne'])
    ).toBe(null)
    expect(matchMutationType('@MUTATION/drago/CANCEL', '*', 'CANCEL')).toEqual([
      'drago',
      'CANCEL',
    ])
    expect(matchMutationType('@MUTATION/drago/CANCEL', '*', 'RUN')).toBe(null)
    expect(
      matchMutationType('@MUTATION/drago/CANCEL', '*', ['RUN', 'CANCEL'])
    ).toEqual(['drago', 'CANCEL'])
    expect(
      matchMutationType('@MUTATION/drago/CANCEL', '*', ['RUN', 'CLEAN'])
    ).toBe(null)
  })
})
