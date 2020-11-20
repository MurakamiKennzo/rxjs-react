import { empty, Subject, Observable } from 'rxjs'
import Scope from './scope'

class ReactSource<T = any> {
  private _sel: Symbol | null
  public _scope: Scope
  public _props$: Subject<T>

  constructor(
    sel: Symbol | null = null,
    scope: Scope = new Scope(),
    props$: Subject<T> = new Subject()
  ) {
    this._sel = sel
    this._scope = scope
    this._props$ = props$
  }

  public select(sel: Symbol) {
    return new ReactSource<T>(sel, this._scope, this._props$)
  }

  public event(evType: string): Observable<any> {
    if(this._sel === null) {
      return empty()
    } else {
      return this._scope.getHandler(this._sel, evType).asObservable()
    }
  }

  public clear() {
    this._scope = new Scope()
  }

  public get props(): Observable<T> {
    return this._props$.asObservable()
  }
}

export default ReactSource
