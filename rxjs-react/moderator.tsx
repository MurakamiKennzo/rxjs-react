import { ReactNode, ForwardedRef, createElement, useContext, useEffect, FC } from 'react'
import Scope from './scope'
import ScopeContext from './scopeContext'

interface ComponentProps {
  sel: Symbol
  children?: ReactNode[]
  [evFn: string]: any
}

interface ReactProps extends ComponentProps {
  ref?: ForwardedRef<any>
}

interface ModeratorProps {
  componentProps: ComponentProps
  componentRef: ForwardedRef<any>
  component: any
}

const Moderator: FC<ModeratorProps> = ({
  componentProps,
  componentRef,
  component,
}) => {
  const scope = useContext(ScopeContext)

  useEffect(() => {
    return () => {
      // scope.remove(componentProps.sel)
    }
  }, [])

  const reactProps = createReactProps({
    scope,
    componentProps,
    componentRef,
  })

  return createElement(component, reactProps, reactProps.children)
}

const createReactProps = ({
  scope,
  componentProps,
  componentRef,
}: { scope: Scope, componentProps: ComponentProps, componentRef?: ForwardedRef<any> }) => {
  let reactProps: ReactProps = { ...componentProps }
  reactProps = incorporateHandlers(reactProps, scope)
  if(componentRef) {
    reactProps.ref = componentRef
  }
  // @ts-ignore
  delete reactProps.sel
  return reactProps
}

const incorporateHandlers = (props: ReactProps, scope: Scope) => {
  const handlers = scope.getSelectorHandlers(props.sel)

  for (const evType of Object.keys(handlers)) {
    const onFn = `on${evType[0].toUpperCase()}${evType.slice(1)}`

    const evHandler = handlers[evType]

    props[onFn] = (...evs: any[]) => evHandler.next(evs.length === 1 ? evs[0] : evs)

  }
  return props
}

export default Moderator
