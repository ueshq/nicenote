// TODO: Implement NativeWind-styled TextInput component
//
// This component will wrap React Native's TextInput with NativeWind styling
// and design token integration. It should support:
//   - label text above the input
//   - placeholder text
//   - error state with error message
//   - multiline mode
//   - controlled value/onChange
//
// Usage:
//   import { TextInput } from '@nicenote/ui-native'
//   <TextInput label="Title" value={title} onChangeText={setTitle} />

export interface TextInputProps {
  label?: string
  placeholder?: string
  value?: string
  onChangeText?: (text: string) => void
  error?: string
  multiline?: boolean
  numberOfLines?: number
  editable?: boolean
}

// Placeholder - actual implementation requires react-native and nativewind
export function TextInput(_props: TextInputProps): never {
  throw new Error('TextInput is a stub. Install react-native and nativewind to use.')
}
