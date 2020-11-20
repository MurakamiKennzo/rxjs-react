/** @jsx createRxReactElement */
import { Main, rxReact, createRxReactElement } from '@rxjs-react'
import { empty } from 'rxjs'
import { map } from 'rxjs/operators'

const main: Main<{ count: number }> = (sources) => {
  
  const props$ = sources.react.props

  const vdom$ = props$.pipe(
    map(({ count }) => (
      <h1>The current count is {count}</h1>
    ))
  )

  const reducer$ = empty()

  return {
    react: vdom$,
    state: reducer$,
  }

}

const Props = rxReact(main)

export default Props
