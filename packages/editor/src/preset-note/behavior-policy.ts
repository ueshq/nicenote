interface NoteBehaviorPolicy {
  immediatelyRender: boolean
  defaultSourceMode: boolean
  sourceModeEnabled: boolean
}

export const NOTE_BEHAVIOR_POLICY: NoteBehaviorPolicy = {
  immediatelyRender: false,
  defaultSourceMode: false,
  sourceModeEnabled: true,
}
