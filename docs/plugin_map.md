---
id: plugin_map
title: Map Plugin
sidebar_label: Map Plugin
---
## Use cases

This plugin modifies the state shape into a dictionary shape. This is extremely useful when you have to work with omogeneous indexed data belonging to a collection. For example, any master-detail based API is a suitable candidate for the usage of this plugin

The map plugin works by changing the state shape, and adjusting selectors, actions and reducer accordingly.

The base state shape is
```js
{
    loading: false,
    data: { /* some data */ },
    error: null
}
```

This shape is replicated for each key to be stored, and the indexed replicas are used as the new state
```js
{
    key1: {
        loading: false,
        data: { /* some data */ },
        error: null
    },
    key2: {
        loading: false,
        data: { /* some data */ },
        error: null
    },
    /* and so on... */
}
```

In order to get this working, you need to configure a keyMakerFunction, that is, a function able to associate any dispatched action (among those regarding the mapped rocketjump) to a key in the store.

The default keyMakerFunction is the following
```js
action => action.meta ? action.meta.id : null
```

The map plugin provides you ad-hoc actions and selectors to interact with the state shape described beforehand

## Configuration
This plugin supports some configuration options:
* __key__: The keyMaker function described in the previous paragraph
* __dataTransform__: Custom transformation to be applied to data before storing them in the map. If set, it must be a function that is passed the output of the async task as a parameter and that must return the content to store in the state, under the `data` key
* __keepCompleted__: Boolean indicating whether to keep in the state entries that correspond to completed tasks or to delete them on completion. This can be useful for instance do deal with situations where we need to track in-flight tasks, but we don't care about their output, just about their completion.

## Usage
```js
import { rj } from 'react-rocketjump'
import rjMap from 'react-rocketjump/plugins/map'

const state = rj(
        rjMap({
            keepSucceeded: true             
        }),
        {
            effect: fetchUsers
        }
    )()
```

## Actions
This plugin injects in the `actions` bag the following action creators:

* __runKey__: performs standard `run` action on an item, given its key. The given id is expected to be the first parameter of the call and is then passed down to the api `params` array and copied into the `meta` object under the `id` key. Hence, the signature of this function is `(id, ...otherParams) => void`
* __cleanKey__: performs standard `clean` action on an item, given its key

## Selectors
This plugin injects in the `selectors` bag the following selectors:

* __getMapData__: retrieves data key from any item, and returns them indexed by key
* __getMapLoadings__: retrieves loading state from any item, and returns them indexed by key
* __getMapFailures__: retrieves error key from any item, and returns them indexed by key

Basically, provided selectors slice the state vertically:

```js
// Suppose this is our state
state = {
    users: {
        23: {
            loading: false,
            data: data_23,
            error: null
        },
        39: {
            loading: false,
            data: data_39,
            error: null
        },
    }
}

let x = getMapData(state);
// x will contain the following structure
{
    23: data_23,
    39: data_39
}
```