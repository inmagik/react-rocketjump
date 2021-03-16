---
id: plugin_cache
title: Cache Plugin
sidebar_label: Cache Plugin
slug: /plugin-cache
---

## Use cases

This plugin acts on the task spawning process: each call of the task is tagged with a (non-unique) key, and task outputs are stored by key. When a task spawns with a cached key, the task is aborted and the cached response is returned. Moreover, cache is common among all the components that connect (maybe inderectly) the `RocketJump Partial` where the cache is introduced. This is particularly useful in read-only environments.

## Configuration

This plugin supports some configuration options:

- **key**: The keyMaker function used to tag each task run with a key deducing it by the spawning parameters
- **size**: The maximum number of entries to be kept in the cache
- **store**: The place where the cache is stored. Available stores can be imported from the plugin file, and are `InMemoryStore`, `LocalStorageStore` and `SessionStorageStore`
- **provider**: The policy used to organize the cache. Possible policies can be imported from the plugin file, and are `LRUCache` and `FIFOCache`
- **ns**: A unique identifier used to separate caches for different `RocketJump Objects`

## Usage

```js
import { rj } from 'react-rocketjump'
import rjCache, { LRUCache, SessionStorageStore } from 'react-rocketjump/plugins/cache'

const state = rj(
        rjCache({
            ns: 'my-state-ns',
            size: 24,
            store: SessionStorageStore,
            provider: LRUCache
        })
        {
            effect: fetchUsers
        }
    )()
```

## Actions

This plugin injects in the `actions` bag the following action creators:

- **resetCache**: removes all the items from the cache associated with the `ns` given in the configuration

## Store details

### SessionStorageStore and LocalStorageStore

These stores are supported, respectively, by `SessionStorage` and `LocalStorage` native objects. A key is created in them for any cached item, and has the shape `{ns}-{task_key}`. In order to clear the cache, the native `localStorage.clear()` and `sessionStorage.clear()` should be used.

### InMemoryStorage

This store is supported by a global variable set outside the application scope. A key is created in this object for any cached item, and has the shape `{ns}-{task_key}`. In order to clear the cache, the helper `clearInMemoryStore()` exported from the plugin file should be used.
