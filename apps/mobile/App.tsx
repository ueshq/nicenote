import React from 'react'

import { NavigationContainer } from '@react-navigation/native'

import { RootNavigator } from './src/navigation'

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  )
}
