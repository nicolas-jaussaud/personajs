import { app } from '../app'

const init = events => {
  
  document.addEventListener('keydown', event => {

    switch(event.which) {
      
      // Move

      case 38:
      case app.keyboard === 'qwerty' ? 87 : 90: // Z or A
        events['moveForward'].start()
      break;

      case 37:
      case app.keyboard === 'qwerty' ? 65 : 81: // Q
        events['moveLeft'].start()  
      break;

      case 39:
      case 68: // D
        events['moveRight'].start()
      break;

      case 40:
      case 83: // S
        events['moveBackward'].start()
      break;

      // End move

      // Jump

      case 32: // Spacebar
        events['jump'].start()
      break;

      // End jump

      // Rotate camera

      case app.keyboard === 'qwerty' ? 81 : 65: // Q or A
      case 33: // ⇑  
        events['rotateLeft'].start()
      break;

      case 69: // E  
      case 34: // ⇓
        events['rotateRight'].start() 
      break;

      // End Rotate camera

    }

  }, false)

  document.addEventListener('keyup', event => {
    
    switch(event.which) {

      // Move

      case 38:
      case app.keyboard === 'qwerty' ? 87 : 90: // Z or A
        events['moveForward'].stop()
      break;

      case 37:
      case app.keyboard === 'qwerty' ? 65 : 81: // Q
        events['moveLeft'].stop()
      break;

      case 39:
      case 68: // S             
        events['moveRight'].stop()
      break;

      case 40:
      case 83: // S
        events['moveBackward'].stop()
      break;
    

      // End move

      // Rotate camera

      case app.keyboard === 'qwerty' ? 81 : 65: // Q or A
      case 33: // ⇑  
        events['rotateLeft'].stop()
      break;

      case 69: // E  
      case 34: // ⇓ 
        events['rotateRight'].stop()        
      break;

      // End Rotate camera

    }

  }, false)

}

export { init }
