function makeRoutineHook(routineList) {
  if (routineList.length === 1) {
    return routineList[0]
  }
  return (...args) => {
    for (const routine of routineList) {
      routine(...args)
    }
  }
}

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
  finalizeExport: (finalExport, startExport, finalConfig) => {
    if (startExport.routine) {
      return {
        ...finalExport,
        routine: makeRoutineHook(startExport.routine),
      }
    }
    return finalExport
  },
}

export default Routines
