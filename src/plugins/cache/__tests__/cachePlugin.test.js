import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'
import { rj, connectRj } from '../../../index'
import rjCache, {
  LRUCache,
  FIFOCache,
  SessionStorageStore,
  LocalStorageStore,
  InMemoryStore,
} from '../index'
import { clearInMemoryStore } from '../stores'

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

const makeRjComponent = (rjState) => {
  const Component = (props) => null

  const RjComponent = connectRj(rjState)(Component)

  const testRenderer = TestRenderer.create(<RjComponent />)
  return testRenderer.root.findByType(Component)
}

describe('Cache Plugin (Session - LRU)', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('runs task if cache is empty', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: SessionStorageStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect,
      }
    )

    const wrapper = makeRjComponent(state)

    await act(async () => {
      wrapper.props.run(1)
    })

    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('does not run task if cache has key', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: SessionStorageStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect,
      }
    )

    const wrapper = makeRjComponent(state)

    await act(async () => {
      await wrapper.props.run.asPromise(1)
    })

    await act(async () => {
      await wrapper.props.run.asPromise(1)
    })

    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('makes a global cache', async () => {
    const effect1 = jest.fn().mockResolvedValue(10)

    const state1 = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: SessionStorageStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect1,
      }
    )

    const wrapper1 = makeRjComponent(state1)

    const run1 = wrapper1.props.run

    const wrapper2 = makeRjComponent(state1)

    const run2 = wrapper2.props.run

    await act(async () => {
      await run1.asPromise(1)
      await run1.asPromise(1)
      await run2.asPromise(1)
      await run1.asPromise(1)
      await run2.asPromise(1)
    })

    expect(effect1).toHaveBeenCalledTimes(1)
  })

  it('keeps key stored', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: SessionStorageStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    await act(async () => {
      asyncForEach([1, 2, 3, 1, 1, 2, 1, 4, 2], async (k) => {
        return await run.asPromise(k)
      })
    })

    expect(effect).toHaveBeenCalledTimes(4)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 2)
    expect(effect).nthCalledWith(3, 3)
    expect(effect).nthCalledWith(4, 4)
  })

  it('requires a size to be set', () => {
    expect(() => {
      rj(
        rjCache({
          // size: 10,
          ns: 'test',
          store: SessionStorageStore,
          provider: LRUCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).toThrow()
  })

  it('requires a namespace to be set', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          // ns: 'test',
          store: SessionStorageStore,
          provider: LRUCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).toThrow()
  })

  it('uses default store if not set', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test',
          // store: SessionStorageStore,
          provider: LRUCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).not.toThrow()
  })

  it('uses default provider if not set', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test',
          store: SessionStorageStore,
          // provider: LRUCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).not.toThrow()
  })

  it('uses default key maker if not provided', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test',
          store: SessionStorageStore,
          provider: LRUCache,
          // key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).not.toThrow()
  })

  it('reserves ns names containing $', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test$',
          store: SessionStorageStore,
          provider: LRUCache,
          // key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).toThrow()
  })

  it('has a stable default key maker', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: SessionStorageStore,
        provider: LRUCache,
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    await act(async () => {
      asyncForEach([1, 2, 3, 1, 1, 2, 1, 4, 2], async (k) => {
        return await run.asPromise(k)
      })
    })

    expect(effect).toHaveBeenCalledTimes(4)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 2)
    expect(effect).nthCalledWith(3, 3)
    expect(effect).nthCalledWith(4, 4)
  })

  it('can deal with a full cache', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 2,
        store: SessionStorageStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    await act(async () => {
      asyncForEach([1, 2, 3, 1, 3, 2, 1, 4, 1], async (k) => {
        return await run.asPromise(k)
      })
    })

    expect(effect).toHaveBeenCalledTimes(7)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 2)
    expect(effect).nthCalledWith(3, 3)
    expect(effect).nthCalledWith(4, 1)
    expect(effect).nthCalledWith(5, 2)
    expect(effect).nthCalledWith(6, 1)
    expect(effect).nthCalledWith(7, 4)
  })

  it('has a cache clearing function', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 2,
        store: SessionStorageStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    expect(wrapper.props.resetCache).not.toBeUndefined()

    const reset = wrapper.props.resetCache

    await act(async () => {
      await run.asPromise(1)
      await run.asPromise(1)
      reset()
      await run.asPromise(1)
    })

    expect(effect).toHaveBeenCalledTimes(2)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 1)
  })
})

describe('Cache Plugin (Local - FIFO)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('runs task if cache is empty', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: LocalStorageStore,
        provider: FIFOCache,
        key: (...args) => args[0],
      }),
      {
        effect,
      }
    )

    const wrapper = makeRjComponent(state)

    await act(async () => {
      wrapper.props.run(1)
    })

    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('does not run task if cache has key', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: LocalStorageStore,
        provider: FIFOCache,
        key: (...args) => args[0],
      }),
      {
        effect,
      }
    )

    const wrapper = makeRjComponent(state)

    await act(async () => {
      await wrapper.props.run.asPromise(1)
    })

    await act(async () => {
      await wrapper.props.run.asPromise(1)
    })

    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('makes a global cache', async () => {
    const effect1 = jest.fn().mockResolvedValue(10)

    const state1 = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: LocalStorageStore,
        provider: FIFOCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect1,
      }
    )

    const wrapper1 = makeRjComponent(state1)

    const run1 = wrapper1.props.run

    const wrapper2 = makeRjComponent(state1)

    const run2 = wrapper2.props.run

    await act(async () => {
      await run1.asPromise(1)
      await run1.asPromise(1)
      await run2.asPromise(1)
      await run1.asPromise(1)
      await run2.asPromise(1)
    })

    expect(effect1).toHaveBeenCalledTimes(1)
  })

  it('keeps key stored', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: LocalStorageStore,
        provider: FIFOCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    await act(async () => {
      asyncForEach([1, 2, 3, 1, 1, 2, 1, 4, 2], async (k) => {
        return await run.asPromise(k)
      })
    })

    expect(effect).toHaveBeenCalledTimes(4)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 2)
    expect(effect).nthCalledWith(3, 3)
    expect(effect).nthCalledWith(4, 4)
  })

  it('requires a size to be set', () => {
    expect(() => {
      rj(
        rjCache({
          // size: 10,
          ns: 'test',
          store: LocalStorageStore,
          provider: FIFOCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).toThrow()
  })

  it('requires a namespace to be set', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          // ns: 'test',
          store: LocalStorageStore,
          provider: FIFOCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).toThrow()
  })

  it('uses default store if not set', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test',
          // store: LocalStorageStore,
          provider: FIFOCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).not.toThrow()
  })

  it('uses default provider if not set', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test',
          store: LocalStorageStore,
          // provider: FIFOCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).not.toThrow()
  })

  it('uses default key maker if not provided', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test',
          store: LocalStorageStore,
          provider: FIFOCache,
          // key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).not.toThrow()
  })

  it('reserves ns names containing $', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test$',
          store: LocalStorageStore,
          provider: FIFOCache,
          // key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).toThrow()
  })

  it('has a stable default key maker', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: LocalStorageStore,
        provider: FIFOCache,
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    await act(async () => {
      asyncForEach([1, 2, 3, 1, 1, 2, 1, 4, 2], async (k) => {
        return await run.asPromise(k)
      })
    })

    expect(effect).toHaveBeenCalledTimes(4)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 2)
    expect(effect).nthCalledWith(3, 3)
    expect(effect).nthCalledWith(4, 4)
  })

  it('can deal with a full cache', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 2,
        store: LocalStorageStore,
        provider: FIFOCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    await act(async () => {
      asyncForEach([1, 2, 3, 1, 3, 2, 1, 4, 1], async (k) => {
        return await run.asPromise(k)
      })
    })

    expect(effect).toHaveBeenCalledTimes(7)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 2)
    expect(effect).nthCalledWith(3, 3)
    expect(effect).nthCalledWith(4, 1)
    expect(effect).nthCalledWith(5, 2)
    expect(effect).nthCalledWith(6, 4)
    expect(effect).nthCalledWith(7, 1)
  })

  it('has a cache clearing function', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 2,
        store: LocalStorageStore,
        provider: FIFOCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    expect(wrapper.props.resetCache).not.toBeUndefined()

    const reset = wrapper.props.resetCache

    await act(async () => {
      await run.asPromise(1)
      await run.asPromise(1)
      reset()
      await run.asPromise(1)
    })

    expect(effect).toHaveBeenCalledTimes(2)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 1)
  })
})

describe('Cache Plugin (InMemory - LRU)', () => {
  beforeEach(() => {
    clearInMemoryStore()
  })

  it('runs task if cache is empty', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: InMemoryStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect,
      }
    )

    const wrapper = makeRjComponent(state)

    await act(async () => {
      wrapper.props.run(1)
    })

    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('does not run task if cache has key', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: InMemoryStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect,
      }
    )

    const wrapper = makeRjComponent(state)

    await act(async () => {
      await wrapper.props.run.asPromise(1)
    })

    await act(async () => {
      await wrapper.props.run.asPromise(1)
    })

    expect(effect).toHaveBeenCalledTimes(1)
  })

  it('makes a global cache', async () => {
    const effect1 = jest.fn().mockResolvedValue(10)

    const state1 = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: InMemoryStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect1,
      }
    )

    const wrapper1 = makeRjComponent(state1)

    const run1 = wrapper1.props.run

    const wrapper2 = makeRjComponent(state1)

    const run2 = wrapper2.props.run

    await act(async () => {
      await run1.asPromise(1)
      await run1.asPromise(1)
      await run2.asPromise(1)
      await run1.asPromise(1)
      await run2.asPromise(1)
    })

    expect(effect1).toHaveBeenCalledTimes(1)
  })

  it('keeps key stored', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: InMemoryStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    await act(async () => {
      asyncForEach([1, 2, 3, 1, 1, 2, 1, 4, 2], async (k) => {
        return await run.asPromise(k)
      })
    })

    expect(effect).toHaveBeenCalledTimes(4)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 2)
    expect(effect).nthCalledWith(3, 3)
    expect(effect).nthCalledWith(4, 4)
  })

  it('requires a size to be set', () => {
    expect(() => {
      rj(
        rjCache({
          // size: 10,
          ns: 'test',
          store: InMemoryStore,
          provider: LRUCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).toThrow()
  })

  it('requires a namespace to be set', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          // ns: 'test',
          store: InMemoryStore,
          provider: LRUCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).toThrow()
  })

  it('uses default store if not set', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test',
          // store: InMemoryStore,
          provider: LRUCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).not.toThrow()
  })

  it('uses default provider if not set', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test',
          store: InMemoryStore,
          // provider: LRUCache,
          key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).not.toThrow()
  })

  it('uses default key maker if not provided', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test',
          store: InMemoryStore,
          provider: LRUCache,
          // key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).not.toThrow()
  })

  it('reserves ns names containing $', () => {
    expect(() => {
      rj(
        rjCache({
          size: 10,
          ns: 'test$',
          store: InMemoryStore,
          provider: LRUCache,
          // key: (...args) => args[0],
        }),
        {
          effect: () => Promise.resolve(10),
        }
      )
    }).toThrow()
  })

  it('has a stable default key maker', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 10,
        store: InMemoryStore,
        provider: LRUCache,
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    await act(async () => {
      asyncForEach([1, 2, 3, 1, 1, 2, 1, 4, 2], async (k) => {
        return await run.asPromise(k)
      })
    })

    expect(effect).toHaveBeenCalledTimes(4)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 2)
    expect(effect).nthCalledWith(3, 3)
    expect(effect).nthCalledWith(4, 4)
  })

  it('can deal with a full cache', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 2,
        store: InMemoryStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    await act(async () => {
      asyncForEach([1, 2, 3, 1, 3, 2, 1, 4, 1], async (k) => {
        return await run.asPromise(k)
      })
    })

    expect(effect).toHaveBeenCalledTimes(7)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 2)
    expect(effect).nthCalledWith(3, 3)
    expect(effect).nthCalledWith(4, 1)
    expect(effect).nthCalledWith(5, 2)
    expect(effect).nthCalledWith(6, 1)
    expect(effect).nthCalledWith(7, 4)
  })

  it('has a cache clearing function', async () => {
    const effect = jest.fn().mockResolvedValue(10)

    const state = rj(
      rjCache({
        ns: 'test',
        size: 2,
        store: InMemoryStore,
        provider: LRUCache,
        key: (...args) => args[0],
      }),
      {
        effect: effect,
      }
    )

    const wrapper = makeRjComponent(state)

    const run = wrapper.props.run

    expect(wrapper.props.resetCache).not.toBeUndefined()

    const reset = wrapper.props.resetCache

    await act(async () => {
      await run.asPromise(1)
      await run.asPromise(1)
      reset()
      await run.asPromise(1)
    })

    expect(effect).toHaveBeenCalledTimes(2)
    expect(effect).nthCalledWith(1, 1)
    expect(effect).nthCalledWith(2, 1)
  })
})

describe('Sanity measures on providers', () => {
  const store = new InMemoryStore()

  const lru = new LRUCache('test', 10, store)
  const fifo = new FIFOCache('beta', 10, store)

  expect(lru.get('1')).toBeUndefined()
  expect(fifo.get('2')).toBeUndefined()
})
