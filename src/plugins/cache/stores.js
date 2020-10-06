const BACKEND = {}

export class InMemoryStore {
  getItem(key) {
    return BACKEND[key]
  }

  setItem(key, value) {
    BACKEND[key] = value
  }

  removeItem(key) {
    delete BACKEND[key]
  }
}

export const clearInMemoryStore = () => {
  for (let k in BACKEND) {
    delete BACKEND[k]
  }
}

export class SessionStorageStore {
  getItem(key) {
    const v = sessionStorage.getItem(key)
    if (v) {
      return JSON.parse(v)
    }
    return v
  }

  setItem(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value))
  }

  removeItem(key) {
    sessionStorage.removeItem(key)
  }
}

export class LocalStorageStore {
  getItem(key) {
    const v = localStorage.getItem(key)
    if (v) {
      return JSON.parse(v)
    }
    return v
  }

  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  removeItem(key) {
    localStorage.removeItem(key)
  }
}
