---
id: plugin_list_delete
title: ListDelete Plugin
sidebar_label: ListDelete Plugin
---
## Use cases

This plugin provides support for deleting items in list-based states. It must be used with care on paginated lists, because it will likely break pagination (i.e. it removes from the current page, likely leaving it with one item less than page size)

## Configuration
This plugin supports some configuration options:
* __path__: the path, relative to the state root, where the list is stored (defaults to 'data')
* __identity__: this function is called once for every element in the list, and is expected to return `true` if the item passed in along with the deleting action is the target of the delete operation (`(action, listItem) => bool` ). Default value is `(action, listItem) => action.item.id === listItem.id`

## Usage
```js
import { rj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList' 
import rjListDelete from 'react-rocketjump/plugins/listDelete'

const listState = rj(
        rjPlainList(),
        rjListDelete({
            identity: (action, listItem) => listItem.id === action.meta.name
        }),
        {
            effect: () => fetch(`http://example.com/items`).then(({ body }) => body)
        }
    )
```

This plugin is already included in rjPlainList and even in rjList (even if it should be used with care), but you may want to customize, for instance, the identity function. It is possible to add it explicitly to a RocketJump in order to override the behaviour of the provided one.

## Actions
This plugin injects in the `actions` bag the following action creators:

* __deleteItem__ (`deleteItem(item)`): deletes zero or more items from the list, according to the `identity` function
