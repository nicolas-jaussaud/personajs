const init = events => {

  const state = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false, // useless
    rotateRight: false,
    rotateLeft: false
  }

  window.addEventListener('gamepadconnected', () => {
    
    // Not sure if we can detect events directly
    setInterval(() => {

      /**
       * TODO: clean and refactor to add support for multiple controllers
       */
      const gamepad = navigator.getGamepads().length > 0 
        ? navigator.getGamepads()[0]
        : false
      ;

      if( gamepad === false ) return;

      // Move

      if( gamepad.axes[1] < -0.5 ) {
        state.moveForward = true
        events['moveForward'].start()
      }
      else if(state.moveForward) {
        state.moveForward = false
        events['moveForward'].stop()
      }

      if( gamepad.axes[1] > 0.5 ) {
        state.moveBackward = true
        events['moveBackward'].start()
      }
      else if(state.moveBackward) {
        state.moveBackward = false
        events['moveBackward'].stop()
      }

      if( gamepad.axes[0] < -0.5 ) {
        state.moveLeft = true
        events['moveLeft'].start()
      }
      else if(state.moveLeft) {
        state.moveLeft = false
        events['moveLeft'].stop()
      }

      if( gamepad.axes[0] > 0.5 ) {
        state.moveRight = true
        events['moveRight'].start()
      }
      else if(state.moveRight) {
        state.moveRight = false
        events['moveRight'].stop()
      }

      // Jump

      if(gamepad.buttons[0].pressed) {
        events['jump'].start()
      }

      // Rotate camera

      if( gamepad.axes[3] > 0.5 ) {
        state.rotateRight = true
        events['rotateRight'].start()
      }
      else if(state.rotateRight) {
        state.rotateRight = false
        events['rotateRight'].stop()
      }

      if( gamepad.axes[3] < -0.5 ) {
        state.rotateLeft = true
        events['rotateLeft'].start()
      }
      else if(state.rotateLeft) {
        state.rotateLeft = false
        events['rotateLeft'].stop()
      }

    }, 100)
    
  })

}

export { init }
