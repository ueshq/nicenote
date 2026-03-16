import React from 'react'

import { NavigationContainer } from '@react-navigation/native'

import { MobileAppShellProvider } from './providers/MobileAppShellProvider'
import { RootNavigator } from './navigation'

export default function App(): React.JSX.Element {
  return (
    <MobileAppShellProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </MobileAppShellProvider>
  )
}
