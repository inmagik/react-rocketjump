---
id: logger
title: Logger
sidebar_label: Logger
slug: /logger
---
As React RocketJump powered applications grow up in size, it becomes very difficult to track and debug all the effect runs and corresponding (concurrent) state updates.

For people coming from the Redux world, it was familiar to debug this kind of issues using ReduxDevTools or other logging tools

This is what it looks like:

![Rj Logger Sample Screen](./assets/logger_rj_in_console.png))

To enable it, just add this snippet to your `index.js`:

```js
import rjLogger from 'react-rocketjump/logger'

// (place this before ReactDOM.render)
rjLogger()
```

Remember to add a name to the configuration object defining your RocketJump Object in order to make it appear in the logger

```js
const TomatoesState = rj({
  effect,
  // ... rj config ...
  name: 'Tomatoes'
})
```

> Being a debug tool, the logger is disabled in production for performance reasons
> Just to be sure, it is neither included in the production bundle, so feel free to (ab)use it in development!