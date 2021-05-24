class Character {

  constructor(object, scene) {
      
    this.object = object
    this.scene = scene

    this.speed = 1
    this.directions = {
      forward:  false,
      left:     false,
      right:    false,
      backward: false,
    }

    this.animationsPath = 'objects/animations/'
    this.animations = []
    this.animationFiles = [
      'run',
      'run-backward',
      'run-left',
      'run-right',
    ]
    
    this.init()
  }

  init() {

    this.loadAnimations()
      
    // Handle controls
    document.addEventListener('keydown', this.controlsStart.bind(this), false)
    document.addEventListener('keyup', this.controlsStop.bind(this), false)
  }

  /**
   * Load all the animations needed for the character
   */
  loadAnimations() {

    this.anim = new THREE.FBXLoader()
    this.anim.setPath(this.animationsPath)             
    this.mixer = new THREE.AnimationMixer(this.object)

    for (let i = 0; i < this.animationFiles.length; i++) {
      this.loadAnimation(this.animationFiles[i])
    }
  }

  loadAnimation(animationName) {
    this.anim.load(animationName + '.fbx', (anim) => {
      this.animations[ animationName ] = this.mixer.clipAction(anim.animations[0])
    })
  }

  render(clock) {

    // Animate character
    if (this.mixer) {
      const delta = clock.getDelta()
      this.mixer.update(delta)
    } 

    // Move character
    if(this.directions.forward === true)  this.object.translateZ(this.speed)
    if(this.directions.left === true)     this.object.translateX(this.speed)
    if(this.directions.right === true)    this.object.translateX(-this.speed) 
    if(this.directions.backward === true) this.object.translateZ(-this.speed) 
  }

  controlsStart(event) {

    console.log(event.which)
    switch(event.which) {
      
      // Moving forward
      case 38:
      case app.keyboard === 'qwerty' ? 87 : 90: // Z or A
        this.do('run')
        this.directions.forward = true
      break;

      // Moving left
      case 37:
      case app.keyboard === 'qwerty' ? 65 : 81: // Q
        this.do('run-left')
        this.directions.left = true
      break;

      // Moving right
      case 39:
      case 68: // D
        this.do('run-right')
        this.directions.right = true
      break;

      // Moving backward
      case 40:
      case 83: // S
        this.do('run-backward')
        this.directions.backward = true
      break;
    }
  }

  controlsStop(event) {

    switch(event.which) {

      // Start moving forward
      case 38:
      case app.keyboard === 'qwerty' ? 87 : 90: // Z or A
        this.end('run')
        this.directions.forward = false
      break;

      // Stop moving left
      case 37:
      case app.keyboard === 'qwerty' ? 65 : 81: // Q
        this.end('run-left')
        this.directions.left = false
      break;

      // Stop moving right
      case 39:
      case 68: // S             
        this.end('run-right')
        this.directions.right = false
      break;

        // Stop moving backward
      case 40:
      case 83: // S
        this.end('run-backward')
        this.directions.backward = false
      break;
    }
  }

  do = (action) => this.animations[ action ] ? this.animations[ action ].play() : ''
  end = (action) => this.animations[ action ] ? this.animations[ action ].stop() : ''

}
