const MUTATION_PREFIX = '@MUTATION'

export function makeMutationType(name, subType = '') {
  return `${MUTATION_PREFIX}/${name}/${subType}`
}

export function matchMutationType(type, matchName, matchSubType) {
  const pieces = type.split('/')
  if (pieces.length !== 3) {
    return null
  }
  const [, name, subType] = pieces

  if (matchName && matchName !== '*') {
    if (Array.isArray(matchName)) {
      if (matchName.indexOf(name) === -1) {
        return null
      }
    } else if (name !== matchName) {
      return null
    }
  }

  if (matchSubType && matchSubType !== '*') {
    if (Array.isArray(matchSubType)) {
      if (matchSubType.indexOf(subType) === -1) {
        return null
      }
    } else if (subType !== matchSubType) {
      return null
    }
  }

  return [name, subType]
}
