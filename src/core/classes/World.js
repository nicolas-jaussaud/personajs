import Camera from './Camera'
import Car from './Car'
import Character from './Character'
import SquareLoader from './SquareLoader'

import { app } from '../app'

export default class World {

  constructor() {
    
    this.worldObjects = []

    // The car logic shoudl be in a separate file at some point
    this.carNumber = 0
    this.initialCarNumber = 5
    this.maxCarNumber = 7

    this.squareLoader = app.squareLoader = new SquareLoader

    this.init()

  }

  async init() {

    this.squareLoader.init()
    
    app.load('character.fbx', character => {

      app.playableCharacter.character = new Character(character)
      app.playableCharacter.characterCamera = new Camera( this.character() )

      character.scale.set(0.002,0.002,0.002)
      
      app.scene.add(character)      
    })

    setInterval( this.shouldLoadCar.bind(this), 500 )

    this.light()
    this.sky()

  }

  character = () => (app.playableCharacter.character)
  characterCamera = () => (app.playableCharacter.characterCamera)

  shouldLoadCar() {
    
    const currentX = this.character() !== false ? this.character().object.position.x : 0
    const currentZ = this.character() !== false ? this.character().object.position.z : 0
    
    if( this.squareLoader.squareExists(currentX, currentZ) === false ) return;

    const square = this.squareLoader.getSquare(currentX, currentZ)

    this.loadCar(() => 
      this.addCar({
        
        // Randomly put the car arround the user (but not on direct square around so that he can't see spawn)

        x: Math.floor(Math.random() * 2) + 1 === 2
          ? [square.lowX + (this.squareLoader.squareSize * 2), square.upX + (this.squareLoader.squareSize * 2)] 
          : [square.lowX - (this.squareLoader.squareSize * 2), square.upX - (this.squareLoader.squareSize * 2)],

        z: Math.floor(Math.random() * 2) + 1 === 2
          ? [square.lowZ + (this.squareLoader.squareSize * 2), square.upZ + (this.squareLoader.squareSize * 2)] 
          : [square.lowZ - (this.squareLoader.squareSize * 2), square.upZ - (this.squareLoader.squareSize * 2)]
      })
    )
  
  }

  loadCar = callback => app.load('car/Car.fbx', car => callback(car))

  /**
   * TODO: Handle car in separte file 
   */
  addCar(coordinates) {

    // Only one car at once to avoid too much objects
    if( this.carNumber >= this.maxCarNumber ) return;

    this.carNumber = this.carNumber + 1

    const fileName = 'car/Car.fbx'
    const car = app.objects[ fileName ].clone()
    car.scale.set(0.012, 0.012, 0.012)

    app.scene.add(car)

    const carController = new Car({
      object:       car,
      squareSize:   this.squareLoader.squareSize,
      coordinates:  coordinates,
      moveCallback: car => {

        const characterVector = new THREE.Vector3( 
          this.character().object.position.x,
          this.character().object.position.y, 
          this.character().object.position.z 
        )
        
        const position = car.config.object.position

        const carVector = new THREE.Vector3(
          position.x, 
          position.y, 
          position.z
        )

        // If car is far or if it reach a non generated square
        if( carVector.distanceTo(characterVector) > 200 || !this.squareLoader.squareExists(position.x, position.z)) {

          clearInterval(moveInterval)

          app.scene.remove(car.config.object)

          this.carNumber = this.carNumber - 1

          console.info( 'One car has been removed. Current Car number is: ' + this.carNumber )
        }

      }
      
    })
    
    const moveInterval = setInterval(() => carController.move(0.5), 20)

    console.info( 'One car has been added. Current Car number is: ' + this.carNumber + ', direction is ' + car.direction )
  }

  render() {

    if(this.character() && this.characterCamera()) {
      this.character().render(app.clock)
      this.characterCamera().render()    
    }
  }

  /**
   * @see https://discourse.threejs.org/t/avoiding-collision-between-two-boxes/11235/9
   */
  isCollision(object) {

    const objectHitBox = new THREE.Box3().setFromObject(object)
    let isCollision = false

    this.worldObjects.map(object => {

      const hitBox = new THREE.Box3().setFromObject(object)
      const collision = objectHitBox.intersectsBox(hitBox)

      if( collision ) isCollision = true
    })

    return isCollision
  }

  light() {

    const sideLight = new THREE.DirectionalLight('rgb(200, 230, 255)', 0.8)
    const hemiLight = new THREE.HemisphereLight( 0x9999FF, 0x88ffFF, 0.7 ); 
    
    sideLight.position.set(-7000000, 10000000, 100)
    sideLight.rotation.x = 0

    app.scene.add(hemiLight)
    app.scene.add(sideLight)
  }

  sky = () => app.scene.background = new THREE.Color( 0x55BBFF )

}
