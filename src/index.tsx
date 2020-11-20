import { BrowserRouter, Switch, Route } from 'react-router-dom'
import React, { FC, useEffect, useState } from 'react'
import { render } from 'react-dom'
import { timer } from 'rxjs'
import Home from '@/home'
import Props from '@/props'
import Count from '@/count'
import TodoList from '@/todoList'

const ReactProps: FC<{}> = () => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const subscription = timer(0, 1000).subscribe(setCount)

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return <Props count={count} />
}

const App: FC<{}> = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact>
        <Home />
      </Route>
      <Route path="/props" exact>
        <ReactProps />
      </Route>
      <Route path="/count" exact>
        <Count />
      </Route>
      <Route path="/todoList" exact>
        <TodoList />
      </Route>
    </Switch>
  </BrowserRouter>
)

render(<App />, document.getElementById('app'))
