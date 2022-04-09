import SquareLoader from './SquareLoader'
import CarLoader from './CarLoader'

import Camera from './models/Camera'
import Character from './models/Character'

import { app } from '../app'

export default class World {

  constructor() {
    
    this.worldObjects = []

    this.carLoader    = app.carLoader = new CarLoader
    this.squareLoader = app.squareLoader = new SquareLoader

    this.init()

  }

  async init() {

    this.squareLoader.init()
    this.carLoader.init()
    
    app.load('character.fbx', character => {

      app.playableCharacter.character = new Character(character)
      app.playableCharacter.characterCamera = new Camera( this.character() )

      character.scale.set(0.002,0.002,0.002)
      
      app.scene.add(character)      
    })

    this.light()
    this.sky()

  }

  isReady = () => (this.squareLoader.isReady() && app.playableCharacter.character)

  character = () => (app.playableCharacter.character)
  characterCamera = () => (app.playableCharacter.characterCamera)

  render() {

    if( app.worldLoaded && this.isReady() ) {
      app.worldLoaded()
      app.worldLoaded = false;
    }

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

      if( collision ) isCollision = object
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
