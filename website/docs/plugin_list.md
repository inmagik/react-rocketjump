---
id: plugin_list
title: List Plugin
sidebar_label: List Plugin
slug: /plugins/list
---

## Use cases

When interacting with a paginated REST API:

- the API returns only a page of the collection at the time, with metadata specifying the position of the page and the total number of pages or objects in the collection.
- some parameters are passed to API requests to identify the page we want to load

This plugins adds pagination state management and related selectors to get:

- current, next and previous pages references
- total items count

Since pagination parametrization and metadata can be implemented with different strategies (page number pagination, limit-offset pagination, token-based pagination, etc.), this plugin offers the possibility to use different adapters. Some common adapters are provided, specifically implemented for django-rest-framework pagination classes, but that may be used as a reference for other pagination adapters.

## Configuration

This plugin supports some configuration options:

- **pagination**: the pagination adapter to be used (required)
- **pageSize**: number of items in a page (required)
- **customListReducer**: custom reducer for the list
- **customPaginationReducer**: custom reducer for the pagination information

## Usage

```js
import { rj } from 'react-rocketjump'
import rjList, {
  nextPreviousPaginationAdapter,
} from 'react-rocketjump/plugins/list'

const GET_ITEMS = 'GET_ITEMS'

const listState = rj(
  rjList({
    pageSize: 50,
    pagination: nextPreviousPaginationAdapter,
  }),
  {
    effect: (page) =>
      fetch(`http://example.com/items?page=${page}`).then((response) =>
        response.json()
      ),
  }
)
```

## Selectors

This plugin injects in the `selectors` bag the following selectors:

- **getList**: returns the items contained in the page that is currently loaded (as an array)
- **getCount**: returns the total number of items in the collection (not in the single page)
- **getNumPages**: returns the overall number of pages in the collection
- **hasNext**: returns a boolean indicating whether this page is the last one (`false`) or not (`true`)
- **hasPrev**: returns a boolean indicating whether this page is the first one (`false`) or not (`true`)
- **getNext**: returns the information that is necessary to inject as params in the `run` call to load the next page. The content of this key depends on the pagination adapter (see later)
- **getPrev**: returns the information that is necessary to inject as params in the `run` call to load the previous page. The content of this key depends on the pagination adapter (see later)
- **getCurrent**: returns the information that was injected in the `run` call to load the current page. The content of this key depends on the pagination adapter (see later)

## Pagination Adapters

A pagination adapter is simply a JavaScript object that describes how to extract pagination information from the output of a task (the response of the REST API, usually). Each property can either be a property path or a function that is called with the output of the task as a parameter (except for the `current` property, which is passed the pagination information the user injected in the `run` call corresponding to the response)

<!-- prettier-ignore -->
```js
{
    list,           // Should point to (or directly return, in case of functions)
                    //    the actual list, the data returned by the REST endpoint
    count,          // Should point to (or directly return, in case of functions)
                    //    the total number of items in the collection
    current,        // Should point to (or directly return, in case of functions)
                    //    the pagination params used to load current page
    next,           // Should point to (or directly return, in case of functions)
                    //    the pagination params to be used to load the next page
    previous        // Should point to (or directly return, in case of functions)
                    //    the pagination params to be used to load the previous page
}
```

The library already provides some pagination adapters, which are designed to work well with django-rest-framework, but they are indeed quite reusable

- nextPrevPaginationAdapter: pagination is based on `next` and `prev` references
- limitOffsetPaginationAdapter: pagination is based on the concepts of `limit` and `offset`

## Provided plugins

This plugin already embeds List Insert Plugin, List Update Plugin and List Delete Plugin, so you don't have to add them manually unless you need to perform some customization on them.
