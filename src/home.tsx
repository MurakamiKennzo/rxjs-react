/** @jsx createRxReactElement */
import { rxReact, Main, createRxReactElement} from '@rxjs-react'
import { empty, of } from 'rxjs'


const main: Main<{}, {}> = () => {

  const vdom$ = of(<h1>hello world</h1>)
  const reducer$ = empty()

  return {
    react: vdom$,
    state: reducer$,
  }
}

const Home = rxReact(main)

export default Home 
