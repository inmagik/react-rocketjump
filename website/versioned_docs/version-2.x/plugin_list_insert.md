---
id: plugin_list_insert
title: ListInsert Plugin
sidebar_label: ListInsert Plugin
slug: /plugin-listinsert
---
## Use cases

This plugin provides support for insertion of items in list-based states. It must be used with care on paginated lists, because it will likely break pagination (i.e. it adds to the current page, even if it is full, thus violating the size of the page)

## Configuration
This plugin supports some configuration options:
* __path__: the path, relative to the state root, where the list is stored (defaults to 'data')
* __merge__: the function used to add an item to the list (`(action, list) => nextList`), defaults to appending

## Usage
```js
import { rj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import rjListInsert from 'react-rocketjump/plugins/listInsert'

const listState = rj(
        rjPlainList(),
        rjListInsert({
            merge: (action, list) => [action.payload.params.item, ...list]
        }),
        {
            effect: () => fetch(`http://example.com/items`).then(({ body }) => body)
        }
    )
```

This plugin is already included in rjPlainList and even in rjList (even if it should be used with care), but you may want to customize, for instance, the merge function. It is possible to add it explicitly to a RocketJump in order to override the behaviour of the provided one.

## Actions
This plugin injects in the `actions` bag the following action creators:

* __insertItem__ (`insertItem(item)`): inserts a new item in the list, according to the `merge` function
