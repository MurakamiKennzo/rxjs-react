# rxjs-react
The right way When using RxJS in React.

**Note: I'm not publish this to npm because I'm just copy the idea from [@cycle/react](https://github.com/cyclejs/react), since it's so old and I just rewrite it by myself.**

## Motivation

Since RxJS and React both are popular, but combine then is so Headache。

The community has some solutions such as [rxjs-hooks](https://github.com/LeetCode-OpenSource/rxjs-hooks). But it's using hooks and isn't a natural solution with RxJS.

In RxJS, everything is a stream, any effect is a stream IO, if you think something not a stream, you're probably not using the right way.

Thanks for [André Staltz](https://github.com/staltz) and his [@cycle/react](https://github.com/cyclejs/react), I get many inspirations. 

Think React is the outside world, you do pure things only in your code, and let React do dirty things for you. Just declare your input stream and output stream, and everything is ok. It's some special driver in [Cycle.js](https://github.com/cyclejs/cyclejs).

## Usage

### For static web page

I code an example in the / path, if you run the app, you will see 'hello world'.

```ts
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
```

### For Props down

If you push some props to app, you can see it at `sources.react.props`, It's an Observable and you can map to do what you want.

```ts
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
```

### For Events

I provide the special `sel` attributes to split your logic and view.

Give an `JSX.Element` a `sel` attributes, and select it by `sources.react.select(sel)`, and then use `event` function to spec the action.

```ts
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
```

### For global State

If you know Lens, you can using global state as a local state. If not, I'll not teach you, you can find it at [Ramda.js](https://ramdajs.com/).

```ts
/** @jsx createRxReactElement */
import { Main, rxReact, createRxReactElement, Reducer, withLens } from '@rxjs-react'
import { merge, Observable, of, combineLatest } from 'rxjs'
import { map, mapTo, pluck } from 'rxjs/operators'
import { filter, always, assoc, identity, lens, lensProp } from 'ramda'

interface State {
  list: ({ name: string, id: number })[]
  todo: string
}

const Todo: Main<{}, State> = (sources) => {
  const state$ = sources.state.stream

  const symbolTodo = Symbol('todo')
  const symbolAdd = Symbol('add')

  const input$: Observable<Reducer<State>> = sources.react.select(symbolTodo).event('change')
                    .pipe(
                      pluck('target', 'value'),
                      map((v: string) => assoc('todo', v))
                    )

  const add$: Observable<Reducer<State>> = sources.react.select(symbolAdd).event('click')
                    .pipe(
                      mapTo(s => ({ ...s, todo: '', list: [...s.list, { name: s.todo, id: Date.now() }] }))
                    )
  
  const reducer$ = merge(input$, add$)

  const vdom$ = state$.pipe(
    map(({todo}) => 
      <p>
        <input sel={symbolTodo} value={todo} />
        <button sel={symbolAdd}>Add</button>
      </p>
    )
  )

  return {
    react: vdom$,
    state: reducer$,
  }

}

const Todos: Main<{}, State['list']> = sources => {
  const state$ = sources.state.stream

  const symbolDelete = Symbol('delete')

  const delete$: Observable<Reducer<State['list']>> = sources.react.select(symbolDelete).event('click')
                    .pipe(
                      pluck('target', 'dataset', 'id'),
                      map(x => +x),
                      map((id: number) => filter<State['list'][0]>(x => x.id !== id ))
                    )

  const reducer$ = delete$

  const vdom$ = state$.pipe(
    map((todos) => 
      <div>
        <h2>Todos:</h2>
        <ul>{ todos.map(todo => <li key={todo.id}>{todo.name}<button sel={symbolDelete} data-id={todo.id}>X</button></li>) }</ul>
      </div>
    )
  )
  
  return {
    react: vdom$,
    state: reducer$,
  }
}

const main: Main<{}, State> = (sources) => {
  const state$ = sources.state.stream

  const todo = withLens<State>(
    lens<any, State, State>(
      identity,
      (state, _) => state,
    ), 
  Todo)(sources)

  const todoVdom$ = todo.react
  const todoReducer$ = todo.state

  const todos = withLens<State>(lensProp('list'), Todos)(sources)
  
  const todosVdom$ = todos.react
  const todosReducer$ = todos.state

  const reducer$: Observable<Reducer<State>> = merge(
    todoReducer$,
    todosReducer$,
    of(always({ list: [], todo: 'dd' })),
  )

  const vdom$ = combineLatest(todoVdom$, todosVdom$)
    .pipe(
      map(([todoVdom, todosVdom]) => (
        <div>
          {todoVdom}
          {todosVdom}
        </div>
      ))
    )

  return {
    react: vdom$,
    state: reducer$,
  }
}

const TodoList = rxReact(main)

export default TodoList
```

See the all example at [src](https://github.com/MurakamiKennzo/rxjs-react/blob/main/src).
