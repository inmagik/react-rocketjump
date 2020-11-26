import single from './singleMutation'
import multi from './multiMutation'

const stadanrdMutations = {
  /**
   * The shortcat to handle a mutation and track a single effect state at time.
   * Default use `'exhaust'` as `takeEffect`.
   */
  single,

  multi,
}

export default stadanrdMutations
