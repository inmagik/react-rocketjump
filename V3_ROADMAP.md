# V3


## ALPHA 1
 - namespace selectors
 ```js
  const Obj = rj({
    selectors: ({ getData }) => ({
      getGang: state => getData(state),
    }),
    mutations: {
      // ...
    }
  })
  // Should grab data
  Obj.makeSelectors().getData(state)
 ```
 - optimistic mutations