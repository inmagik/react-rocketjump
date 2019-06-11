---
id: plugin_debounce
title: Debounce Plugin
sidebar_label: Debounce Plugin
---

## Use cases

This plugin acts on the spawn process of effect executions, applying a debouncing function. This is useful to throttle the rate at which task execution are spawned, expecially if you are dealing with APIs that have a rate limit or that are billed basing on the number of invocations

## Configuration

This plugin takes exactly one argument of type `int`, that corresponds to the debouncing time.

## Usage

```js
import { rj } from 'react-rocketjump'
import rjDebounce from 'react-rocketjump/plugins/debounce'

const state = rj(rjDebounce(200), {
  effect: fetchUsers,
})()
```

## Actions

This plugin injects in the `actions` bag the following action creators:

- **runDebounced**: functionally equivalent, debounced version of `run` predefined action
