import { Lens, over, view } from 'ramda'
import { Observable, Subject, Subscription } from 'rxjs'
import { startWith, scan, skip, map } from 'rxjs/operators'
import ReactSource from './reactSource'

export type Reducer<T = any> = (a: T) => T

export type Main<P = any, S = any> = (
  sources: {
    react: ReactSource<P>
    state: StateSource<S>
  }
) => {
    react: Observable<React.ReactElement | null>
    state: Observable<Reducer<S>>
  }

class StateSource<T = any> {
  public _state$: Subject<T>
  private _subscription: Subscription | null

  constructor() {
    this._state$ = new Subject()
    this._subscription = null
  }

  public get stream(): Observable<T> {
    return this._state$.asObservable()
  }

  public init(state$: Observable<Reducer<T>>) {
    const newState$: Observable<T> = state$.pipe(
      startWith(undefined as unknown as T),
      // @ts-ignore
      scan((x, f) => f && f(x)),
      skip(1),
    )

    this._subscription = newState$.subscribe(x => this._state$.next(x))
  }

  clear() {
    this._state$.complete()
    this._subscription && this._subscription.unsubscribe()
  }
}

export const withLens = <S extends {} = any, P extends {} = any, CS extends {} = any>(lens: Lens, main: Main<P, CS>) => 
  (sources: { react: ReactSource<P>, state: StateSource<CS> }): 
    {
      react: Observable<React.ReactElement | null>
      state: Observable<Reducer<S>>
    } => {

    const sinks = main({
      ...sources,
      state: ({
        stream: sources.state.stream.pipe(
          map(view(lens))
        )
      }) as StateSource<CS>
    })

    return {
      ...sinks,
      state: sinks.state.pipe(map(f => over(lens, f))),
    }
  }

export default StateSource
