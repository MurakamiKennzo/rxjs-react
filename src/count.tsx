/** @jsx createRxReactElement */
import { Main, rxReact, createRxReactElement, Reducer } from '@rxjs-react'
import { merge, Observable, of } from 'rxjs'
import { map, mapTo } from 'rxjs/operators'
import { add, always, lensProp, over } from 'ramda'

interface State {
  count: number
}

const main: Main<{}, State> = (sources) => {
  const state$ = sources.state.stream

  const increase = Symbol('increase')
  const decrease = Symbol('decrease')

  const increase$ = sources.react.select(increase).event('click').pipe(mapTo(1))
  const decrease$ = sources.react.select(decrease).event('click').pipe(mapTo(-1))

  const action$: Observable<Reducer<State>> = merge(increase$, decrease$).pipe(map(x => over(lensProp('count'), add(x))))

  const reducer$: Observable<Reducer<State>> = merge(of(always({count: 0})), action$)

  const vdom$ = state$.pipe(
    map(({ count }) => (
      <div>
        <p>The current count is { count }</p>
        <p>
          <button sel={increase}>Increase</button>
          <button sel={decrease}>Decrease</button>
        </p>
      </div>
    ))
  )

  return {
    react: vdom$,
    state: reducer$,
  }
}

const Count = rxReact(main)

export default Count
