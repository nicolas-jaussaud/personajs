class Camera {

  constructor(camera, character) {
      
    this.camera = camera
    this.character = character

    // Distance from the character
    this.distance = 4
    this.height = 2.5

    // Rotation speed
    this.speed = 30
    this.rotation = 0

    this.directions = {
      left:   false,
      right:  false
    }

    this.init()
  }

  init() {

    // Handle controls
    document.addEventListener('keydown', this.controlsStart.bind(this), false)
    document.addEventListener('keyup', this.controlsStop.bind(this), false)
  }

  controlsStart(event) {

    switch(event.which) {

      // Rotate left
      case app.keyboard === 'qwerty' ? 81 : 65: // Q or A
      case 33: // ⇑  
        this.directions.left = true
      break;

      // Rotate right
      case 69: // E  
      case 34: // ⇓ 
        this.directions.right = true
      break;
    }
  }

  controlsStop(event) {

    switch(event.which) {

      // Rotate left
      case app.keyboard === 'qwerty' ? 81 : 65: // Q or A
      case 33: // ⇑  
        this.directions.left = false
      break;

      // Rotate right
      case 69: // E  
      case 34: // ⇓ 
        this.directions.right = false        
      break;
    }
  }

  /**
   * Put camera behind the character and follow it
   */
  render() {
    
    this.updatePosition()
    
    let rotZ, rotX
    
    rotZ = Math.cos( (Math.PI / 2) + this.rotation )
    rotX = Math.sin( (Math.PI / 2) + this.rotation )
    
    this.camera.position.x = this.character.object.position.x - this.distance * rotZ
    this.camera.position.y = this.character.object.position.y + this.height
    this.camera.position.z = this.character.object.position.z - this.distance * rotX
    
    this.character.object.rotation.y = - this.rotation

    this.camera.position.y = this.camera.position.y + 1
    
    // A little above the character
    this.camera.lookAt(new THREE.Vector3(
      this.character.object.position.x,
      this.character.object.position.y + 3,
      this.character.object.position.z
    ))
  }

  updatePosition() {
    if(this.directions.left === true)   this.rotation -= this.speed / 180
    if(this.directions.right === true)  this.rotation += this.speed / 180 
  }

}
