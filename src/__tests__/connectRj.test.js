import React from 'react'
import TestRenderer, { act } from 'react-test-renderer'
import connectRj from '../connectRj'
import rj from '../rj'

describe('connectRj', () => {
  it('should have the default props defined by rj', () => {
    const rjState = rj(() => Promise.resolve(1312))

    const Component = (props) => null
    const RjComponent = connectRj(rjState)(Component)
    const testRenderer = TestRenderer.create(<RjComponent />)
    const wrapper = testRenderer.root.findByType(Component)
    const props = wrapper.props

    expect(props.data).toBe(null)
    expect(props.error).toBe(null)
    expect(props.pending).toBe(false)
    expect(props).toHaveProperty('run')
    expect(props).toHaveProperty('clean')
    expect(props).toHaveProperty('cancel')
  })

  it('should have the props accorded to rj computed config if given', () => {
    const rjState = rj(
      rj({
        computed: {
          pop34: 'isLoading',
          budda: 'getBudda',
        },
        selectors: () => ({
          getBudda: () => 23,
        }),
      }),
      {
        effect: () => Promise.resolve(1312),
        selectors: (s) => ({
          getBudda: () => s.getBudda() * 2,
        }),
        computed: {
          babu: 'isLoading',
          gioVa: 'getData',
          fuck: 'getError',
        },
      }
    )
    const Component = (props) => null
    const RjComponent = connectRj(rjState)(Component)
    const testRenderer = TestRenderer.create(<RjComponent />)
    const wrapper = testRenderer.root.findByType(Component)
    const props = wrapper.props

    expect(props.data).toBe(undefined)
    expect(props.error).toBe(undefined)
    expect(props.pending).toBe(undefined)
    expect(props.babu).toBe(false)
    expect(props.fuck).toBe(null)
    expect(props.pop34).toBe(undefined)
    expect(props.budda).toBe(46)
  })

  it('should have the props accorded to rj computed config and accesible in mapStateToProps', () => {
    const rjState = rj(
      rj({
        computed: {
          pop34: 'isLoading',
          budda: 'getBudda',
        },
        selectors: () => ({
          getBudda: () => 23,
        }),
      }),
      {
        effect: () => Promise.resolve(1312),
        selectors: (s) => ({
          getBudda: () => s.getBudda() * 2,
        }),
        computed: {
          babu: 'isLoading',
          giova: 'getData',
          fuck: 'getError',
        },
      }
    )
    const Component = (props) => null
    const RjComponent = connectRj(
      rjState,
      (state, selectors, props, computedState) => {
        // Expect default state
        expect(state).toEqual({
          data: null,
          pending: false,
          error: null,
        })
        // Expect computed to be applied
        expect(computedState).toEqual({
          babu: false,
          giova: null,
          fuck: null,
          budda: 46,
        })

        return {
          DRAGO: selectors.getBudda(state),
        }
      }
    )(Component)
    const testRenderer = TestRenderer.create(<RjComponent />)
    const wrapper = testRenderer.root.findByType(Component)
    const props = wrapper.props

    expect(props.DRAGO).toBe(46)
    expect(props.data).toBe(undefined)
    expect(props.error).toBe(undefined)
    expect(props.pending).toBe(undefined)
    expect(props.babu).toBe(undefined)
    expect(props.fuck).toBe(undefined)
    expect(props.pop34).toBe(undefined)
    expect(props.budda).toBe(undefined)
  })

  it('should get angry with a non rj object is passed as argument', () => {
    const Component = (props) => null
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

  it('should run rj sideEffects and react to succees', async () => {
    const mockFn = jest.fn().mockResolvedValue(23)
    const rjState = rj(mockFn)

    const Component = (props) => null
    const RjComponent = connectRj(rjState, (state, { getData }) => ({
      friends: getData(state),
    }))(Component)
    const testRenderer = TestRenderer.create(<RjComponent />)
    const wrapper = testRenderer.root.findByType(Component)

    expect(wrapper.props.friends).toBe(null)

    await act(async () => {
      wrapper.props.run()
    })
    expect(mockFn).toHaveBeenCalledTimes(1)

    await act(async () => {
      await mockFn.mock.results[0].value
    })
    expect(wrapper.props.friends).toBe(23)
  })
})
