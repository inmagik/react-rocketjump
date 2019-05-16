---
id: plugin_plain_list
title: PlainList Plugin
sidebar_label: PlainList Plugin
---
## Use cases

When interacting with lists of data, the basic tools provided by React-RocketJump can be too coarse. This plugin provides support for operations like

* prepend
* append
* in-order insert (requires a bit of configuration)
* item update
* single item insert
* item delete

## Configuration
This plugin supports some configuration options:
* __customListReducer__: custom reducer for the list

## Usage
```js
import { rj } from 'react-rocketjump'
import rjPlainList from 'redux-rocketjump/plugins/plainList' 

const listState = rj(
        rjPlainList(),
        {
            effect: () => fetch(`http://example.com/items`).then(({ body }) => body)
        }
    )
```

## Selectors
This plugin injects in the `selectors` bag the following selectors:

* __getList__: returns the items contained in the page that is currently loaded (as an array)
* __getCount__: returns the total number of items in the collection

## Provided plugins
This plugin already embeds List Insert Plugin, List Update Plugin and List Delete Plugin, so you don't have to add them manually unless you need to perform some customization on them