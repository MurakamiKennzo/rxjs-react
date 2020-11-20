import { createContext, Context } from 'react'
import Scope from './scope'

const ScopeContext: Context<Scope> = createContext<Scope>(new Scope())

export default ScopeContext
