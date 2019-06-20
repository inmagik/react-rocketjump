---
id: plugin_all
title: Plugins
sidebar_label: Introduction
---

React-RocketJump ships with a set of plugins that can be used as out of the box solutions for common tasks. The creation and usage of plugins is heavily based on the composition features embedded in React-RocketJump.

Plugins are usually implemented as `RocketJump Partials` that you use by composing them. This makes extremely easy to create new plugins: indeed, every RocketJump Partial is a plugin.

We recommend you to read the documentation of the plugin(s) you are interested in to know more about the services it can offer and how to use it.

The following plugins are available out of the box:

- [List Plugin](plugin_list.md): tools for managing paginated state
- [PlainList Plugin](plugin_plain_list.md): tools for managing list-based state
- [ListInsert Plugin](plugin_list_insert.md): tools for easing out insertion of items in a list
- [ListUpdate Plugin](plugin_list_update.md): tools for easing out updating operations on the items of a list
- [ListDelete Plugin](plugin_list_delete.md): tools for managing deletions of items from a list
- [Map Plugin](plugin_map.md): tools for organizing state like a map of substates
- [Cache Plugin](plugin_cache.md): tools for caching task outputs and avoid repeating invocations
