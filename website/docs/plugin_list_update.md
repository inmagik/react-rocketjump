---
id: plugin_list_update
title: ListUpdate Plugin
sidebar_label: ListUpdate Plugin
slug: /plugins/listUpdate
---

## Use cases

This plugin provides support for updating items in list-based states.

## Configuration

This plugin supports some configuration options:

- **path**: the path, relative to the state root, where the list is stored (defaults to 'data')
- **identity**: this function is called once for every element in the list, and is expected to return `true` if the item passed in along with the updating action is the target of the update operation (`(action, listItem) => bool` ). Default value is `(action, listItem) => action.item.id === listItem.id`
- **updater**: this function is passed in the action and the item to update (detected using the identity function), and is expected to return the updated item (`(action, item) => newItem`). Default value is `(action, item) => action.item`

## Usage

```js
import { rj } from 'react-rocketjump'
import rjPlainList from 'react-rocketjump/plugins/plainList'
import rjListUpdate from 'react-rocketjump/plugins/listUpdate'

const listState = rj(
  rjPlainList(),
  rjListUpdate({
    identity: (action, listItem) => listItem.id === action.meta.name,
  }),
  {
    effect: () => fetch(`http://example.com/items`).then(({ body }) => body),
  }
)
```

This plugin is already included in rjPlainList and in rjList, but you may want to customize, for instance, the identity function. It is possible to add it explicitly to a RocketJump in order to override the behaviour of the provided one.

## Actions

This plugin injects in the `actions` bag the following action creators:

- **updateItem** (`updateItem(item)`): updates zero or more items in the list, according to the `identity` function and the `updater` function
