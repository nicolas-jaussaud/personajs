import { init } from './init'

export const app = {
  element:  null,
  scene:    null,
  renderer: null,
  camera:   null,
  keyboard: 'qwerty',
  world:    null,
  init:     init,
  playableCharacter: {
    character:       false,
    characterCamera: false
  },
  squareLoaderReady: false, // Should think of a hook system
  newSquareLoaded: false, // Should also think of a hook system
  worldLoaded: false, // Should still think of a hook system
  deadCallback: false, // Same as above
  loadedSquare: [],
  debug: false
}
