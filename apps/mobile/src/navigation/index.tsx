import React from 'react'

import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { HomeScreen } from '../screens/HomeScreen'
import { NoteEditorScreen } from '../screens/NoteEditorScreen'

export type RootStackParamList = {
  Home: undefined
  NoteEditor: { noteId?: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export function RootNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTintColor: '#0a0a0a',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'NiceNote' }} />
      <Stack.Screen
        name="NoteEditor"
        component={NoteEditorScreen}
        options={{ title: 'Edit Note' }}
      />
    </Stack.Navigator>
  )
}
