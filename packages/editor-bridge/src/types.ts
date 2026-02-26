// ──────────────────────────────────────────────────────────────────────────────
// Commands sent from React Native to the WebView editor
// ──────────────────────────────────────────────────────────────────────────────

export type EditorCommand =
  | { type: 'SET_CONTENT'; payload: string }
  | { type: 'GET_CONTENT' }
  | { type: 'TOGGLE_SOURCE_MODE' }
  | { type: 'SET_EDITABLE'; payload: boolean }
  | { type: 'FOCUS' }
  | { type: 'BLUR' }

// ──────────────────────────────────────────────────────────────────────────────
// Events sent from the WebView editor back to React Native
// ──────────────────────────────────────────────────────────────────────────────

export type EditorEvent =
  | { type: 'CONTENT_CHANGED'; payload: string }
  | { type: 'READY' }
  | { type: 'HEIGHT_CHANGED'; payload: number }
  | { type: 'FOCUS_CHANGED'; payload: boolean }

// ──────────────────────────────────────────────────────────────────────────────
// Bridge message wrapper (used over postMessage)
// ──────────────────────────────────────────────────────────────────────────────

export interface BridgeMessage<T = EditorCommand | EditorEvent> {
  source: 'nicenote-editor'
  data: T
}

// ──────────────────────────────────────────────────────────────────────────────
// Editor WebView component props
// ──────────────────────────────────────────────────────────────────────────────

export interface EditorWebViewProps {
  initialContent?: string
  editable?: boolean
  onContentChange?: (content: string) => void
  onReady?: () => void
  onHeightChange?: (height: number) => void
  onFocusChange?: (focused: boolean) => void
}

// ──────────────────────────────────────────────────────────────────────────────
// Editor bridge hook return type
// ──────────────────────────────────────────────────────────────────────────────

export interface EditorBridgeState {
  isReady: boolean
  isFocused: boolean
  content: string
  setContent: (content: string) => void
  focus: () => void
  blur: () => void
  setEditable: (editable: boolean) => void
  toggleSourceMode: () => void
}
