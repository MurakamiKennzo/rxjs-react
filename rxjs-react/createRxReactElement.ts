import { createElement } from 'react'
import adapt from './adapt'

const createRxReactElement = (
  type: any,
  props: any,
  ...children: any[]
 ) => 
  createElement(props?.sel ? adapt(type) : type, props, ...children)

export default createRxReactElement
