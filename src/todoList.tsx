/** @jsx createRxReactElement */
import { Main, rxReact, createRxReactElement, Reducer, withLens } from '@rxjs-react'
import { merge, Observable, of, combineLatest } from 'rxjs'
import { map, mapTo, pluck } from 'rxjs/operators'
import { always, assoc, identity, lens, lensProp } from 'ramda'

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
                      map((id: number) => list => list.filter(x => x.id !== id ))
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
