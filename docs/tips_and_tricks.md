---
id: tips_and_tricks
title: Tips & Tricks
sidebar_label: Custom hooks
---

## Use custom Hooks

In many cases you may want to combine several `RocketJump Objects` together, maybe because they are strictly related. The typical example here is dealing with REST APIs: you have `GET`, `POST`, `PUT`, `DELETE` and maybe even `PATCH` verbs, each mapped onto its own `RocketJump Object`. Importing all of them every time can be just a little bit tedious. You can avoid this by writing your own custom hook that combines several `useRj` hooks and you are done!

**Example**

```js
import { useEffect, useCallback } from 'react'
import { getMyItem, updateMyItem, deleteMyItem } from './myItemApi'

const GetItem = rj({
  effect: getMyItem,
  actions: () => ({
    writeBack: data => ({ type: 'write-back', data }),
  }),
  reducer: oldReducer => (state, action) => {
    if (action.type === 'write-back') {
      return {
        ...state,
        data: action.data,
      }
    } else {
      return oldReducer(state, action)
    }
  },
})

const UpdateItem = rj({
  effect: updateMyItem,
})

const DeleteItem = rj({
  effect: deleteMyItem,
})

const useMyItem = id => {
  const [{ data: item }, { run: loadItem, writeBack }] = useRj(GetItem)
  const [ignored, { run: updateItem }] = useRj(UpdateItem)
  const [unused, { run: deleteItem }] = useRj(DeleteItem)

  const updateAndWriteBack = useCallback(
    (...args) => {
      updateItem.onSuccess(updatedItem => writeBack(updatedItem)).run(...args)
    },
    [updateItem, writeBack]
  )

  const deleteAndWriteBack = useCallback(
    (...args) => {
      deleteItem.onSuccess(() => writeBack(null)).run(...args)
    },
    [deleteItem, writeBack]
  )

  useEffect(() => {
    loadItem(id)
  }, [loadItem, id])

  return [item, { update: updateAndWriteBack, delete: deleteAndWriteBack }]
}

export default useMyItem
```
