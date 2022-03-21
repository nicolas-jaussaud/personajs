import { app } from '../app'

import { init as initKeyboard } from './keyboard.js'
import { init as initController } from './controller.js'

/**
 * Add controller support
 */

const character = () => (app.playableCharacter.character)
const camera = () => (app.playableCharacter.characterCamera)

const init = () => {

  const events = {
    jump: {
      start: () => (character().startEvent('jump')),
      stop: () => (true), // No neeed to end this event
    },
    moveForward: {
      start: () => (character().startEvent('moveForward')),
      stop: () => (character().endEvent('moveForward')),
    },
    moveBackward: {
      start: () => (character().startEvent('moveBackward')),
      stop: () => (character().endEvent('moveBackward')),
    },
    moveLeft: {
      start: () => (character().startEvent('moveLeft')),
      stop: () => (character().endEvent('moveLeft')),
    },
    moveRight: {
      start: () => (character().startEvent('moveRight')),
      stop: () => (character().endEvent('moveRight')),
    },
    rotateRight: {
      start: () => (camera().startEvent('rotateRight')),
      stop: () => (camera().endEvent('rotateRight')),
    },
    rotateLeft: {
      start: () => (camera().startEvent('rotateLeft')),
      stop: () => (camera().endEvent('rotateLeft')),
    }
  }

  initKeyboard(events)

  initController(events)

}



export { init }
