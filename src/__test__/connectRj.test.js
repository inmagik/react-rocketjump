import React from 'react'
import { act } from 'react-dom/test-utils'
import Enzyme, { mount } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import connectRj from '../connectRj'
// import memoize from 'memoize-one'
import rj from '../rj'

Enzyme.configure({ adapter: new Adapter() })

describe('connectRj', () => {
  const makeRjComponent = (...args) => {
    const Component = props => null
    const RjComponent = connectRj(...args)(Component)

    return mount(<RjComponent />)
  }

  it('should have the default props defined by rj', () => {
    const rjState = rj(() => Promise.resolve(1312))
    const wrapper = makeRjComponent(rjState)

    const props = wrapper.find('Component').props()
    expect(props.data).toBe(null)
    expect(props.error).toBe(null)
    expect(props.pending).toBe(false)
    expect(props).toHaveProperty('run')
    expect(props).toHaveProperty('clean')
    expect(props).toHaveProperty('cancel')
  })

  it('should get angry with a non rj object is passed as argument', () => {
    const Component = props => null
    expect(() => {
      connectRj(rj())(Component)
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to connectRj/
    )
    expect(() => {
      connectRj({})(Component)
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to connectRj/
    )
    expect(() => {
      connectRj(23)(Component)
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to connectRj/
    )
    expect(() => {
      connectRj()(Component)
    }).toThrowError(
      /\[react-rocketjump\] You should provide a rj object to connectRj/
    )
  })

  it('should run rj sideEffects and react to succees', async done => {
    const mockFn = jest.fn().mockResolvedValue(23)
    const rjState = rj(mockFn)

    const wrapper = makeRjComponent(rjState, (state, { getData }) => ({
      friends: getData(state),
    }))

    expect(wrapper.find('Component').props().friends).toBe(null)

    await act(async () => {
      wrapper
        .find('Component')
        .props()
        .run()
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    mockFn.mock.results[0].value.then(() => {
      wrapper.update()
      expect(wrapper.find('Component').props().friends).toBe(23)
      done()
    })
  })
})
