export default class Car {

  constructor(args) {

    this.config   = args
    this.nextTurn = false

    // Where to place the car according to the direction
    this.roadPosition = {
      1: { x: 0, y: 0, z: 4.5 },
      2: { x: 0, y: 0, z: -4.5 },
      3: { x: -4.5, y: 0, z: 0 },
      4: { x: 4.5, y: 0, z: 0 }
    }

    this.initPosition       = this.initPosition.bind(this)
    this.move               = this.move.bind(this)
    this.setDirection       = this.setDirection.bind(this)
    this.changeDirection    = this.changeDirection.bind(this)
    this.resetRoadPosition  = this.resetRoadPosition.bind(this)
    this.setRoadPosition    = this.setRoadPosition.bind(this)
    this.setRotation        = this.setRotation.bind(this)
    this.setNextTurn        = this.setNextTurn.bind(this)
    
    this.initPosition()
  }

  setDirection() {
    this.direction = Math.floor(Math.random() * 4) + 1
  }

  initPosition() {

    const coordinates = this.config.coordinates
    this.setDirection()

    switch(this.direction) {

      case 1:
        this.config.object.position.x = coordinates.x[0]
        this.config.object.position.z = coordinates.z[0]
        break;

      case 2:
        this.config.object.position.x = coordinates.x[1]
        this.config.object.position.z = coordinates.z[1]
        break;

      case 3:
        this.config.object.position.x = coordinates.x[0]
        this.config.object.position.z = coordinates.z[0] 
        break;

      case 4:
        this.config.object.position.x = coordinates.x[1]
        this.config.object.position.z = coordinates.z[1] 
        break;

    }

    this.setRotation()
    
    this.setNextTurn()

    this.setRoadPosition()
  }

  move(distance) {
    
    if( this.isTurning === true ) {
      this.turn(distance)
      return;
    }

    switch(this.direction) {
      case 1: this.config.object.position.x = this.config.object.position.x + distance; break;
      case 2: this.config.object.position.x = this.config.object.position.x - distance; break;
      case 3: this.config.object.position.z = this.config.object.position.z + distance; break;
      case 4: this.config.object.position.z = this.config.object.position.z - distance; break;
    }

    if( this.nextTurn === false ) return;
    
    switch(this.direction) {
      case 1: this.config.object.position.x > this.nextTurn ? this.changeDirection() : ''; break;
      case 2: this.config.object.position.x < this.nextTurn ? this.changeDirection() : ''; break;
      case 3: this.config.object.position.z > this.nextTurn ? this.changeDirection() : ''; break;
      case 4: this.config.object.position.z < this.nextTurn ? this.changeDirection() : ''; break;
    }

    this.config.moveCallback(this)
  }

  resetRoadPosition() {

    const roadPosition = this.roadPosition[ this.direction ]

    for(const axe in roadPosition) {
      this.config.object.position[ axe ] = this.config.object.position[ axe ] - roadPosition[ axe ]
    }  
  }

  setRoadPosition() {

    const roadPosition = this.roadPosition[ this.direction ]

    for(const axe in roadPosition) {
      this.config.object.position[ axe ] = this.config.object.position[ axe ] + roadPosition[ axe ]
    }  
  }

  changeDirection() {
    
    this.resetRoadPosition()

    this.setDirection()

    this.setRoadPosition()

    this.setNextTurn()

    this.setRotation()

  }

  setRotation() {
    switch(this.direction) {
      case 1: this.config.object.rotation.y = Math.PI / 2; break;
      case 2: this.config.object.rotation.y = -Math.PI / 2; break;
      case 3: this.config.object.rotation.y = 0; break;
      case 4: this.config.object.rotation.y = -Math.PI; break;
    }
  }

  setNextTurn() {

    switch(this.direction) {

      case 1:
        this.nextTurn = this.config.object.position.x + this.config.squareSize
        break;

      case 2:
        this.nextTurn = this.config.object.position.x - this.config.squareSize
        break;

      case 3:
        this.nextTurn = this.config.object.position.z + this.config.squareSize
        break;

      case 4:
        this.nextTurn = this.config.object.position.z - this.config.squareSize
        break;
    }
  }

}
