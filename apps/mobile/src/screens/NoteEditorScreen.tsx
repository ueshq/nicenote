import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'

// TODO: Integrate @nicenote/editor-bridge for rich text editing via WebView
// TODO: Load note content from @nicenote/database
// TODO: Auto-save with debounce via @nicenote/store
// TODO: Add toolbar for formatting actions

export function NoteEditorScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.placeholder}>Editor will be rendered here via WebView bridge</Text>
        {/* TODO: Replace with <EditorWebView /> from @nicenote/editor-bridge */}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholder: {
    fontSize: 16,
    color: '#a3a3a3',
    textAlign: 'center',
  },
})
