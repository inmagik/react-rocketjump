const BACKEND = {} as Record<string, any>

export interface CacheStore {
  getItem(key: string): any
  setItem(key: string, value: any): void
  removeItem(key: string): void
}

export class InMemoryStore implements CacheStore {
  getItem(key: string) {
    return BACKEND[key]
  }

  setItem(key: string, value: any) {
    BACKEND[key] = value
  }

  removeItem(key: any) {
    delete BACKEND[key]
  }
}

export const clearInMemoryStore = () => {
  for (let k in BACKEND) {
    delete BACKEND[k]
  }
}

export class SessionStorageStore implements CacheStore {
  getItem(key: string) {
    const v = sessionStorage.getItem(key)
    if (v) {
      return JSON.parse(v)
    }
    return v
  }

  setItem(key: string, value: any) {
    sessionStorage.setItem(key, JSON.stringify(value))
  }

  removeItem(key: string) {
    sessionStorage.removeItem(key)
  }
}

export class LocalStorageStore implements CacheStore {
  getItem(key: string) {
    const v = localStorage.getItem(key)
    if (v) {
      return JSON.parse(v)
    }
    return v
  }

  setItem(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  removeItem(key: any) {
    localStorage.removeItem(key)
  }
}
