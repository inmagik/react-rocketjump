---
id: plugin_mutations_pending
title: Mutations Pending Plugin
sidebar_label: Mutations Pending Plugin
slug: /plugins/mutationsPending
---

## Use cases

This plugin helps you tracking pending state for multiple mutation. <br />
This is useful if you want to show in your UI a global loader if any mutations
is in pending state. <br />
This plugins is implemented with it's own piece of state so you can use it
without have to specfy reducer on your mutations. <br />
Under the hood a counter is increment for every mutation `PENDING` and decrement for
every mutation `SUCCESS`, `FAILURE`.

## Selectors

This plugin inject the `anyMutationPending` selector that returs a _boolean_.

## Usage

If you call it without args the plugin tracks **ALL** mutations.

```js
import { rj } from 'react-rocketjump'
import rjMutationsPending from 'react-rocketjump/plugins/mutationsPending'

const MyObj = rj(rjMutationsPending(), {
  // ...
  computed: {
    busy: 'anyMutationPending',
    // ...
  },
})
```

You can pass it a list that specify which mutations should tracked:

```js
import { rj } from 'react-rocketjump'
import rjMutationsPending from 'react-rocketjump/plugins/mutationsPending'

const MyObj = rj(rjMutationsPending(['updateStuff', 'deleteStuff']), {
  mutations: {
    updateStuff: {
      // ...
    },
    createStuff: {
      // ...
    },
    deleteStuff: {
      // ...
    },
  },
  // ...
  computed: {
    busy: 'anyMutationPending',
    // ...
  },
})
```
