import { app } from '../app'

import Car from './models/Car'

export default class CarLoader {

  constructor() {

    this.carNumber        = 0
    this.initialCarNumber = 5
    this.maxCarNumber     = 7

    this.shouldLoadCar = this.shouldLoadCar.bind(this)
    this.loadCar       = this.loadCar.bind(this)
    this.addCar        = this.addCar.bind(this)
    
  }
  
  init() {
    setInterval( this.shouldLoadCar.bind(this), 500 )
  }

  shouldLoadCar() {
    
    const squareLoader = app.world.squareLoader
    
    const currentX = app.world.character() !== false ? app.world.character().object.position.x : 0
    const currentZ = app.world.character() !== false ? app.world.character().object.position.z : 0
    
    if( squareLoader.squareExists(currentX, currentZ) === false ) return;

    const square = squareLoader.getSquare(currentX, currentZ)
    
    this.loadCar(() => 
      this.addCar({
        
        // Randomly put the car arround the user (but not on direct square around so that he can't see spawn)

        x: Math.floor(Math.random() * 2) + 1 === 2
          ? [square.lowX + (squareLoader.squareSize * 2), square.upX + (squareLoader.squareSize * 2)] 
          : [square.lowX - (squareLoader.squareSize * 2), square.upX - (squareLoader.squareSize * 2)],

        z: Math.floor(Math.random() * 2) + 1 === 2
          ? [square.lowZ + (squareLoader.squareSize * 2), square.upZ + (squareLoader.squareSize * 2)] 
          : [square.lowZ - (squareLoader.squareSize * 2), square.upZ - (squareLoader.squareSize * 2)]
      })
    )
  
  }

  loadCar = callback => app.load('car/Car.fbx', car => callback(car))

  addCar(coordinates) {

    // Only one car at once to avoid too much objects
    if( this.carNumber >= this.maxCarNumber ) return;

    this.carNumber = this.carNumber + 1

    const fileName = 'car/Car.fbx'
    const car = app.objects[ fileName ].clone()
    car.scale.set(0.012, 0.012, 0.012)
    
    app.scene.add(car)

    const squareLoader = app.world.squareLoader

    const carController = new Car({
      object:       car,
      squareSize:   squareLoader.squareSize,
      coordinates:  coordinates,
      moveCallback: car => {

        const characterVector = new THREE.Vector3( 
          app.world.character().object.position.x,
          app.world.character().object.position.y, 
          app.world.character().object.position.z 
        )
        
        const position = car.config.object.position

        const carVector = new THREE.Vector3(
          position.x, 
          position.y, 
          position.z
        )

        // If car is far or if it reach a non generated square
        if( carVector.distanceTo(characterVector) > 200 || !squareLoader.squareExists(position.x, position.z)) {

          clearInterval(moveInterval)

          app.scene.remove(car.config.object)

          this.carNumber = this.carNumber - 1

          if( app.debug ) {
            console.info( 'One car has been removed. Current Car number is: ' + this.carNumber ) 
          } 
        }

      }
      
    })
    
    const moveInterval = setInterval(() => carController.move(0.5), 20)

    if( app.debug ) {
      console.info( 'One car has been added. Current Car number is: ' + this.carNumber + ', direction is ' + car.direction )
    }
  }
}
