import React from 'react'
import TestRenderer from 'react-test-renderer'
import rj from '../rj'
import compose from '../compose'
import connectRj from '../connectRj'

describe('compose', () => {
  it('should compose rjs', () => {
    const MaComponent = (props) => null
    const rjState = rj(() => Promise.resolve(1312))
    const RjComponent = compose(
      connectRj(
        rjState,
        (state) => ({ un: state.data }),
        ({ run }) => ({ loadUn: run })
      ),
      connectRj(
        rjState,
        (state) => ({ dos: state.data }),
        ({ run }) => ({ loadDos: run })
      ),
      connectRj(
        rjState,
        (state) => ({ tres: state.data }),
        ({ run }) => ({ loadTres: run })
      )
    )(MaComponent)
    const testRenderer = TestRenderer.create(<RjComponent />)
    const wrapper = testRenderer.root.findByType(MaComponent)
    expect(wrapper.props).toHaveProperty('un')
    expect(wrapper.props).toHaveProperty('dos')
    expect(wrapper.props).toHaveProperty('tres')
    expect(wrapper.props).toHaveProperty('loadUn')
    expect(wrapper.props).toHaveProperty('loadDos')
    expect(wrapper.props).toHaveProperty('loadTres')
  })
})
