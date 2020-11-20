import React, { forwardRef } from 'react'
import Moderator from './moderator'

const components = new Map<any, any>()

const adapt = (type: any) => {
  if(!components.get(type)) {
    components.set(
      type,
      forwardRef((props: any, ref) => (
        <Moderator 
          componentProps={props}
          componentRef={ref}
          component={type}
        />
      ))
    )
  }

  return components.get(type)
}

export default adapt
