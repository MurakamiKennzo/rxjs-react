import React, { ComponentType, FC, useState, useEffect } from 'react'
import { Observable } from 'rxjs'
import ReactSource from "./reactSource"
import ScopeContext from './scopeContext'
import StateSource from "./stateSource"
import type { Reducer, Main } from "./stateSource"

type Run<P = any, S = any> = () => {
  react: {
    source: ReactSource<P>
    sink: Observable<React.ReactElement | null>
  }

  state: {
    source: StateSource<S>
    sink: Observable<Reducer<S>>
  }
}

const rxReact = <P extends {} = any, S extends {} = any>(main: Main<P, S>): ComponentType<P> => {
  const run: Run<P, S> = () => {
    const reactSource = new ReactSource<P>()
    const stateSource = new StateSource<S>()

    const sinks = main({ react: reactSource, state: stateSource })
    const { react: reactSink, state: stateSlink } = sinks

    return { 
      react: {
        source: reactSource, 
        sink: reactSink,
      },
      state: {
        source: stateSource, 
        sink: stateSlink,
      }
    }
  }

  return makeRxReact<P, S>(run)
}

const makeRxReact = <P extends {} = any, S extends {} = any>(run: Run<P>): FC<P> => (props: P) => {
  const [source, setSource] = useState<ReactSource<P> | null>(null)
  const [sink, setSink] = useState<Observable<React.ReactElement | null> | null>(null)
  const [stateObservable, setStateObservable] = useState<{ source: StateSource<S>, sink: Observable<Reducer<S>> } | null>(null)

  useEffect(() => {
    const { react, state } = run()
    setSource(react.source)
    setSink(react.sink)
    setStateObservable(state)

    return () => {
      react.source.clear()
    }
  }, [])

  useEffect(() => {
    if(source) {
      source._props$.next(props)
    }
  }, [source, props])

  useEffect(() => {
    if(source) {
      return () => {
        source._props$.complete()
      }
    }
  }, [source])

  if(!source || !sink || !stateObservable) return null

  return (
    <ScopeContext.Provider value={source._scope}>
      <Sink sink={sink} state={stateObservable} />
    </ScopeContext.Provider>
  )
}

const Sink: FC<{ sink: Observable<React.ReactElement | null>, state: { source: StateSource, sink: Observable<Reducer> } }> = ({sink, state}) => {
  const [vdom, setVdom] = useState<React.ReactElement | null>(null)

  useEffect(() => {
    const subscription = sink.subscribe(setVdom)

    state.source.init(state.sink)

    return () => {
      subscription.unsubscribe()
      state.source.clear()
    }
  }, [])

  return vdom
} 

export default rxReact

