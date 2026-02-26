import React from 'react'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'

// TODO: Replace with actual note list fetched from @nicenote/database
// TODO: Integrate @nicenote/store for state management
// TODO: Add FAB for creating new notes
// TODO: Add folder sidebar / drawer navigation

export function HomeScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>NiceNote</Text>
        <Text style={styles.subtitle}>Your notes will appear here</Text>
        {/* TODO: Replace with FlatList of notes */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No notes yet. Tap + to create one.</Text>
        </View>
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
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0a0a0a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#737373',
    marginBottom: 24,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#a3a3a3',
  },
})
