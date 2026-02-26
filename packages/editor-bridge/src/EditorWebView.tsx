// TODO: Implement WebView with Tiptap editor
//
// This component will render a react-native-webview that loads the Tiptap
// editor bundle. It communicates with the editor via postMessage / onMessage
// using the EditorCommand and EditorEvent protocol defined in ./types.ts.
//
// Implementation plan:
//   1. Build a standalone HTML bundle of the Tiptap editor (packages/editor)
//   2. Load it into a WebView component
//   3. Forward EditorCommands via webViewRef.injectJavaScript()
//   4. Listen for EditorEvents via onMessage handler
//
// For now, we export a placeholder component type. The actual implementation
// requires react-native and react-native-webview to be installed.

import type { EditorWebViewProps } from './types'

// Placeholder component - will be replaced with actual WebView implementation
// when react-native dependencies are available.
export function EditorWebView(_props: EditorWebViewProps): never {
  // TODO: Replace with actual react-native-webview implementation
  throw new Error('EditorWebView is a stub. Install react-native and react-native-webview to use.')
}
