import { merge } from 'rxjs'

const Routines = {
  name: 'Routines',
  makeExport: (extendExport, rjConfig) => {
    if (typeof rjConfig.routine === 'function') {
      return {
        ...extendExport,
        routine: (extendExport.routine || []).concat(rjConfig.routine),
      }
    }
    return extendExport
  },
  extraSideEffects: (rjExport, { getRootState }) => {
    // No need to create routines
    if (!rjExport.routine || rjExport.routine.length === 0) {
      return null
    }

    const { routine } = rjExport

    return routine.map((makeRoutineObs) => {
      return function createMakeRxObx() {
        return function makeObx(
          actionObx,
          stateObx,
          placeholderEffectCaller,
          prevObservable
        ) {
          const routineObs = makeRoutineObs(
            actionObx,
            stateObx,
            // Helpers.....
            {
              getRootState,
            }
          )
          return [merge(routineObs, prevObservable)]
        }
      }
    })
  },
}

export default Routines
