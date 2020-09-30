export class LRUCache {
  constructor(namespace, size, store) {
    this.namespace = namespace
    this.size = size
    this.store = store
  }

  _effectiveKey(key) {
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

  _setMeta(nextMeta) {
    this.store.setItem(`$${this.namespace}-meta`, nextMeta)
  }

  _resetMeta() {
    this.store.removeItem(`$${this.namespace}-meta`)
  }

  has(key) {
    const realKey = this._effectiveKey(key)
    return !!this._meta().dict[realKey]
  }

  get(key) {
    const realKey = this._effectiveKey(key)
    const meta = this._meta()
    if (!!meta.dict[realKey]) {
      meta.lru = [...meta.lru.filter((key) => key !== realKey), realKey]
      this._setMeta(meta)
      return this.store.getItem(realKey)
    } else {
      return undefined
    }
  }

  set(key, value) {
    const realKey = this._effectiveKey(key)
    const meta = this._meta()
    if (!meta.dict[realKey]) {
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
    }
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

export class FIFOCache {
  constructor(namespace, size, store) {
    this.namespace = namespace
    this.size = size
    this.store = store
  }

  _effectiveKey(key) {
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

  _setMeta(nextMeta) {
    this.store.setItem(`$${this.namespace}-meta`, nextMeta)
  }

  _resetMeta() {
    this.store.removeItem(`$${this.namespace}-meta`)
  }

  has(key) {
    const realKey = this._effectiveKey(key)
    return !!this._meta().dict[realKey]
  }

  get(key) {
    const realKey = this._effectiveKey(key)
    const meta = this._meta()
    if (!!meta.dict[realKey]) {
      return this.store.getItem(realKey)
    } else {
      return undefined
    }
  }

  set(key, value) {
    const realKey = this._effectiveKey(key)
    const meta = this._meta()
    if (!meta.dict[realKey]) {
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
    }
    this.store.setItem(realKey, value)
  }

  delete(key) {
    const keyToDelete = this._effectiveKey(key)
    const meta = this._meta()
    this.store.removeItem(keyToDelete)
    delete meta.dict[keyToDelete]
    meta.count--
    this._setMeta(meta)
  }

  clear() {
    const meta = this._meta()
    Object.keys(meta.dict).forEach((key) => {
      this.store.removeItem(key)
    })
    this._resetMeta()
  }
}
