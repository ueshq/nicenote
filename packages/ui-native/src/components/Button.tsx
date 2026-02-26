// TODO: Implement NativeWind-styled Button component
//
// This component will wrap React Native's Pressable with NativeWind styling
// and design token integration. It should support:
//   - variant: 'primary' | 'secondary' | 'ghost' | 'destructive'
//   - size: 'sm' | 'md' | 'lg'
//   - disabled state
//   - loading state with ActivityIndicator
//
// Usage:
//   import { Button } from '@nicenote/ui-native'
//   <Button variant="primary" onPress={handlePress}>Save</Button>

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onPress?: () => void
  children?: string
}

// Placeholder - actual implementation requires react-native and nativewind
export function Button(_props: ButtonProps): never {
  throw new Error('Button is a stub. Install react-native and nativewind to use.')
}
