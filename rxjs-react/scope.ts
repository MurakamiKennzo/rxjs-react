// @ts-nocheck
// since Symbol as a key not support in TypeScript
import { Subject } from 'rxjs'

class Scope {
  private handlers: {
    [sel: Symbol]: {
      [evType: string]: Subject<any>
    }
  }

  constructor() {
    this.handlers = {}
  }

  public getSelectorHandlers(sel: Symbol) {
    return this.handlers[sel] || {}
  }

  public getHandler(sel: Symbol, evType: string) {
    this.handlers[sel] = this.handlers[sel] || {}

    if(!this.handlers[sel][evType]) {
      this.handlers[sel][evType] = new Subject()
    }

    return this.handlers[sel][evType]
  }

  /** never remove since can cause thing changed */
  public remove(sel: Symbol) {
    delete this.handlers[sel]
  }
}

export default Scope
