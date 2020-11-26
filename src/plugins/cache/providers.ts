import { CacheStore } from './stores'

export interface CacheProvider {
  readonly namespace: string
  readonly size: number
  readonly store: CacheStore


  has(key: string): boolean
  get(key: string): any
  set(key: string, value: any): any
  clear(): void
}

export class LRUCache implements CacheProvider {
  readonly namespace: string
  readonly size: number
  readonly store: CacheStore

  constructor(namespace: string, size: number, store: CacheStore) {
    this.namespace = namespace
    this.size = size
    this.store = store
  }

  _effectiveKey(key: string) {
    return `${this.namespace}-${key}`
  }

  _meta() {
    const m = this.store.getItem(`$${this.namespace}-meta`)
    if (m) {
      return { ...m }
    } else {
      return { count: 0, lru: [], dict: {} }
    }
  }

  _setMeta(nextMeta: any) {
    this.store.setItem(`$${this.namespace}-meta`, nextMeta)
  }

  _resetMeta() {
    this.store.removeItem(`$${this.namespace}-meta`)
  }

  has(key: string) {
    const realKey = this._effectiveKey(key)
    return !!this._meta().dict[realKey]
  }

  get(key: string) {
    const realKey = this._effectiveKey(key)
    const meta = this._meta()
    if (!!meta.dict[realKey]) {
      meta.lru = [...meta.lru.filter((key: any) => key !== realKey), realKey]
      this._setMeta(meta)
      return this.store.getItem(realKey)
    } else {
      return undefined
    }
  }

  set(key: string, value: any) {
    const realKey = this._effectiveKey(key)
    const meta = this._meta()
    if (meta.count === this.size) {
      const keyToDelete = meta.lru.shift()
      this.store.removeItem(keyToDelete)
      delete meta.dict[keyToDelete]
      meta.count--
    }
    meta.dict[realKey] = 1
    meta.count++
    meta.lru = [...meta.lru, realKey]
    this._setMeta(meta)
    this.store.setItem(realKey, value)
  }

  clear() {
    const meta = this._meta()
    Object.keys(meta.dict).forEach((key) => {
      this.store.removeItem(key)
    })
    this._resetMeta()
  }
}

export class FIFOCache implements CacheProvider {
  readonly namespace: string
  readonly size: number
  readonly store: CacheStore

  constructor(namespace: string, size: number, store: CacheStore) {
    this.namespace = namespace
    this.size = size
    this.store = store
  }

  _effectiveKey(key: string) {
    return `${this.namespace}-${key}`
  }

  _meta() {
    const m = this.store.getItem(`$${this.namespace}-meta`)
    if (m) {
      return { ...m }
    } else {
      return { count: 0, queue: [], dict: {} }
    }
  }

  _setMeta(nextMeta: any) {
    this.store.setItem(`$${this.namespace}-meta`, nextMeta)
  }

  _resetMeta() {
    this.store.removeItem(`$${this.namespace}-meta`)
  }

  has(key: string) {
    const realKey = this._effectiveKey(key)
    return !!this._meta().dict[realKey]
  }

  get(key: string) {
    const realKey = this._effectiveKey(key)
    const meta = this._meta()
    if (!!meta.dict[realKey]) {
      return this.store.getItem(realKey)
    } else {
      return undefined
    }
  }

  set(key: string, value: any) {
    const realKey = this._effectiveKey(key)
    const meta = this._meta()
    if (meta.count === this.size) {
      const keyToDelete = meta.queue.shift()
      this.store.removeItem(keyToDelete)
      delete meta.dict[keyToDelete]
      meta.count--
    }
    meta.dict[realKey] = 1
    meta.count++
    meta.queue = [...meta.queue, realKey]
    this._setMeta(meta)
    this.store.setItem(realKey, value)
  }

  clear() {
    const meta = this._meta()
    Object.keys(meta.dict).forEach((key) => {
      this.store.removeItem(key)
    })
    this._resetMeta()
  }
}
