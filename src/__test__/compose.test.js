import React from 'react'
import rj from '../rj'
import compose from '../compose'
import connectRj from '../connectRj'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

describe('compose', () => {
  it('should compose rjs', () => {
    const MaComponent = props => null
    const rjState = rj(() => Promise.resolve(1312))
    const RjComponent = compose(
      connectRj(
        rjState,
        state => ({ un: state.data }),
        ({ load }) => ({ loadUn: load })
      ),
      connectRj(
        rjState,
        state => ({ dos: state.data }),
        ({ load }) => ({ loadDos: load })
      ),
      connectRj(
        rjState,
        state => ({ tres: state.data }),
        ({ load }) => ({ loadTres: load })
      )
    )(MaComponent)
    const wrapper = shallow(<RjComponent />)
      .shallow()
      .shallow()
      .find(MaComponent)
    expect(wrapper.props()).toHaveProperty('un')
    expect(wrapper.props()).toHaveProperty('dos')
    expect(wrapper.props()).toHaveProperty('tres')
    expect(wrapper.props()).toHaveProperty('loadUn')
    expect(wrapper.props()).toHaveProperty('loadDos')
    expect(wrapper.props()).toHaveProperty('loadTres')
  })
})
