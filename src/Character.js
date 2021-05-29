class Character {

  constructor(object, scene) {
      
    this.object = object
    this.scene = scene

    this.speed = 0.5

    this.jumpHeight = 2
    this.jumpMaxSpeed = 1
    this.jumpSpeed = this.jumpMaxSpeed
    this.initialJumpPosition = false

    this.directions = {
      forward:  false,
      left:     false,
      right:    false,
      backward: false,
      up:       false,
      down:     false
    }

    this.animationsPath = 'objects/animations/'
    this.animations = []
    this.animationFiles = [
      'run',
      'run-backward',
      'run-left',
      'run-right',

      'jump',
      'jump-forward',
      'jump-backward',
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

  isJumping = () => (this.directions.up || this.directions.down)

  loadAnimation(animationName) {
    this.anim.load(animationName + '.fbx', (anim) => {

      anim.animations[0].name = animationName 
      this.animations[ animationName ] = this.mixer.clipAction(anim.animations[0])

      // Animation that dosen't loop
      if(animationName.includes('jump')) {

        this.animations[ animationName ].clampWhenFinished = true
        this.animations[ animationName ].loop = THREE.LoopOnce

        // We need to stop the animation otherwise we can't replay it
        this.mixer.addEventListener('finished', (e) => e.action.stop())
      }
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

    // Jump (There might be a better way to handle this)
    if(this.directions.up === true) {
      
      /**
       * Need to stop at some point otherwise we will never reach max position
       * 
       * TODO: find a more elegant way to acheive this 
       */
      this.jumpSpeed = this.jumpSpeed > this.jumpMaxSpeed * 0.02
        ? this.jumpSpeed * 0.8
        : this.jumpSpeed

      this.object.translateY(+this.jumpSpeed)

      if(this.object.position.y >= this.targetJumpPosition) {
        this.directions.up   = false
        this.directions.down = true
      }
    }
    else if(this.directions.down === true) {

      this.jumpSpeed = this.jumpSpeed < this.jumpMaxSpeed * 0.95
        ? this.jumpSpeed * 1.1
        : this.jumpSpeed

      this.object.translateY(-this.jumpSpeed)

      if(this.object.position.y <= this.initialJumpPosition) {
        this.object.position.y = this.initialJumpPosition
        this.directions.down = false
      }
    }
  }

  controlsStart(event) {

    switch(event.which) {
      
      // Move

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

      // End move

      // Jump
      case 32: // Spacebar
  
        if(this.directions.up === true || this.directions.down === true) return;

        if(this.directions.forward === true) {
          this.do('jump-forward')
        }
        else if(this.directions.backward === true) {
          this.do('jump-backward')
        }
        // No animation for left or right for now
        else if(this.directions.left === true || this.directions.right === true) {
          this.do('jump-forward')
        }
        // For static jump, we don't really move
        else {
          this.do('jump')
          return;
        } 

        this.directions.up = true
        
        this.initialJumpPosition = this.object.position.y
        this.targetJumpPosition = this.object.position.y + this.jumpHeight
      
        // Will dicrease until we go down
        this.jumpSpeed = this.jumpMaxSpeed

      break;
      // End jump

    }
  }

  controlsStop(event) {

    switch(event.which) {

      // Move

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

      // End move
    }
  }

  do = (action) => this.animations[ action ] ? this.animations[ action ].play() : ''
  end = (action) => this.animations[ action ] ? this.animations[ action ].stop() : ''

}
