class World {

  constructor(app) {

    this.loader =  {
      fbx: new THREE.FBXLoader(),
      mtl: new THREE.MTLLoader(),
      obj: new THREE.OBJLoader(),
    }

    this.objectPath = './objects/'
    
    this.scene  = app.scene
    this.el     = app.el
    this.camera = app.camera
    this.clock  = app.clock
    
    // False until loaded
    this.character          = false
    this.characterCamera    = false
    
    this.loadedObject = {}
    this.worldObjects = []
    
    // Needed to load dynamically
    this.loadedSquare = []
    this.squareSize = 60
    this.roadSize = 30
    this.threesPerSquare = 10
    this.squareVisibility = 2

    this.carNumber = 0
    this.initialCarNumber = 5
    this.maxCarNumber = 20

    this.init()

  }

  async init() {
      
    this.fbx('character.fbx', (character) => {
      
      this.character = new Character(character, this.scene)
      character.scale.set(0.002,0.002,0.002)
      
      this.scene.add(character)
      
      this.characterCamera = new Camera(this.camera, this.character)
    })

    this.initSquares()
    this.light()
    this.sky()
  }

  initSquares() { 

    // First square
    this.loadSquareMap({
      x: [-(this.squareSize / 2), this.squareSize / 2],
      z: [-(this.squareSize / 2), this.squareSize / 2]
    }, true)

    // Check if we need to load more square according to user position 

    setInterval(() => this.shouldLoadSquare(), 500)
    
    setInterval(() => this.shouldLoadCar(), 500)
  }

  /**
   * Square base is road + sidewalk
   */
  createSquareFloor(coordinates) {

    // White band of the road
    this.addPlaneGeometry( this.squareSize, coordinates, 0xFFFFFF, 0 )
    
    // Road
    const roadSize = this.squareSize - (this.roadSize * 0.01)
    this.addPlaneGeometry( roadSize, coordinates, 0x555555, 1 )

    // Lawn
    const lawnSize = this.squareSize - (this.roadSize / 2)
    this.addPlaneGeometry( lawnSize, coordinates, 0x55FF66, 2 )
  }

  addPlaneGeometry(size, coordinates, color, zIndex) {

    const geometry  = new THREE.PlaneGeometry( size, size )
    const material  = new THREE.MeshPhongMaterial( {color: color } )
    const mesh      = new THREE.Mesh( geometry, material )
    
    mesh.position.x = (coordinates.x[1] + coordinates.x[0]) / 2
    mesh.position.z = (coordinates.z[1] + coordinates.z[0]) / 2
    mesh.position.y = 0 + (zIndex / 100)

    mesh.rotation.x = - Math.PI / 2

    this.scene.add(mesh)
  }

  loadSquareMap(coordinates, firstSquare =  false) {

    // We don't want to reload this square
    const loadedKey = coordinates.x[0] + '-' + coordinates.x[1] + '-' + coordinates.z[0] + '-' + coordinates.z[1]
    
    if( this.loadedSquare[ loadedKey ] ) return;

    this.loadedSquare[ loadedKey ] = true
    
    this.createSquareFloor(coordinates)

    // First square has to be empty + init cars
    if( firstSquare ) {
      this.loadCar(() => {
        for (let i = 0; i < this.initialCarNumber; i++) this.addCar(coordinates)
      })
      return;
    }

    const randomSquareType = Math.floor(Math.random() * 6) + 1

    /**
     * 5/6 of the time it's a bulding square, otherwise a park square
     */
    switch(randomSquareType) {

      // Park
      case 4: this.loadTreesFile(() => {
        for (let i = 0; i < this.threesPerSquare; i++) this.addRandomTree(coordinates)
      })
      break;
      
      // Building
      default: this.loadBuildingsFile(() => this.addRandomBuilding(coordinates))
    }

    console.info('New square loaded: ' + coordinates.x[0] + ' ' + coordinates.x[1] + ' ' + coordinates.z[0] + ' ' + coordinates.z[1])
  }

  squareExists(x, z) {

    const square = this.getSquare(x, z)

    const loadedKey = square.lowX + '-' + square.upX + '-' + square.lowZ + '-' + square.upZ

    return this.loadedSquare[ loadedKey ] ? true : false
  }

  getSquare(x, z) {

    const halfSquare = this.squareSize / 2
    const coordinates = {}

    coordinates.lowZ = Math.ceil( (z - halfSquare) / this.squareSize ) * this.squareSize - halfSquare
    coordinates.lowX = Math.ceil( (x - halfSquare) / this.squareSize ) * this.squareSize - halfSquare
    
    coordinates.upX = coordinates.lowX + this.squareSize
    coordinates.upZ = coordinates.lowZ + this.squareSize

    return coordinates
  }

  shouldLoadSquare() {
    
    // If character not loaded yet, position will be 0
    const currentX = this.character !== false ? this.character.object.position.x : 0
    const currentZ = this.character !== false ? this.character.object.position.z : 0
    
    const square = this.getSquare(currentX, currentZ)

    console.info('Current square is: ' + square.lowX + ' ' + square.upX + ' ' + square.lowZ + ' ' + square.upZ)

    /**
     * Load square arround current one in every direction, according to squareVisibility attribute
     */

    
    for (let i = 0; i < this.squareVisibility; i++) {

      const squareDistance = this.squareSize * (i + 1)

      // Whataever the distance is, we want to load middle square and angle on each side 
      
      // Angles and middle with lower X position 
      this.loadSquareMap({
        x: [square.lowX - squareDistance, square.upX - squareDistance],
        z: [square.lowZ, square.upZ],
      })
      this.loadSquareMap({
        x: [square.lowX - squareDistance, square.upX - squareDistance],
        z: [square.lowZ + squareDistance, square.upZ + squareDistance],
      })
      this.loadSquareMap({
        x: [square.lowX - squareDistance, square.upX - squareDistance],
        z: [square.lowZ - squareDistance, square.upZ - squareDistance],
      })
      
      // Middles with same X position but lower and higer Z 
      this.loadSquareMap({
        x: [square.lowX, square.upX],
        z: [square.lowZ + squareDistance, square.upZ + squareDistance],
      })
      this.loadSquareMap({
        x: [square.lowX, square.upX],
        z: [square.lowZ - squareDistance, square.upZ - squareDistance],
      })
      
      // Angles and middle with upper X position 
      this.loadSquareMap({
        x: [square.lowX + squareDistance, square.upX + squareDistance],
        z: [square.lowZ, square.upZ],
      })
      this.loadSquareMap({
        x: [square.lowX + squareDistance, square.upX + squareDistance],
        z: [square.lowZ + squareDistance, square.upZ + squareDistance],
      })
      this.loadSquareMap({
        x: [square.lowX + squareDistance, square.upX + squareDistance],
        z: [square.lowZ - squareDistance, square.upZ - squareDistance],
      })

      // Then, we load missing squares between middle and angles, expect if squareDistance is 1 because everything is already loaded

      if(i === 0) continue;

      for (let k = 0; k < this.squareVisibility; k++) {

        const currentDistance = this.squareSize * (k + 1)
        
        // Between angles and middle, lower X position 
        this.loadSquareMap({
          x: [square.lowX - squareDistance, square.upX - squareDistance],
          z: [square.lowZ + currentDistance, square.upZ + currentDistance],
        })

        this.loadSquareMap({
          x: [square.lowX - squareDistance, square.upX - squareDistance],
          z: [square.lowZ - currentDistance, square.upZ - currentDistance],
        })

        // Between angles and middle, higher X position
        this.loadSquareMap({
          x: [square.lowX + squareDistance, square.upX + squareDistance],
          z: [square.lowZ + currentDistance, square.upZ + currentDistance],
        })

        this.loadSquareMap({
          x: [square.lowX + squareDistance, square.upX + squareDistance],
          z: [square.lowZ - currentDistance, square.upZ - currentDistance],
        })

        // Between angles and middle, lower Z position
        this.loadSquareMap({
          x: [square.lowX - currentDistance, square.upX - currentDistance],
          z: [square.lowZ - squareDistance, square.upZ - squareDistance],
        })
        
        this.loadSquareMap({
          x: [square.lowX + currentDistance, square.upX + currentDistance],
          z: [square.lowZ - squareDistance, square.upZ - squareDistance],
        })

        // Between angles and middle, higher Z position
        this.loadSquareMap({
          x: [square.lowX - currentDistance, square.upX - currentDistance],
          z: [square.lowZ + squareDistance, square.upZ + squareDistance],
        })
        
        this.loadSquareMap({
          x: [square.lowX + currentDistance, square.upX + currentDistance],
          z: [square.lowZ + squareDistance, square.upZ + squareDistance],
        })
      }

    
    }
    
  }

  shouldLoadCar() {

    const currentX = this.character !== false ? this.character.object.position.x : 0
    const currentZ = this.character !== false ? this.character.object.position.z : 0
    
    if( this.squareExists(currentX, currentZ) === false ) return;

    const square = this.getSquare(currentX, currentZ)

    this.loadCar(() => 
      this.addCar({
        
        // Randomly put the car arround the user (but not on direct square around so that he can't see spawn)

        x: Math.floor(Math.random() * 2) + 1 === 2
          ? [square.lowX + (this.squareSize * 2), square.upX + (this.squareSize * 2)] 
          : [square.lowX - (this.squareSize * 2), square.upX - (this.squareSize * 2)],

        z: Math.floor(Math.random() * 2) + 1 === 2
          ? [square.lowZ + (this.squareSize * 2), square.upZ + (this.squareSize * 2)] 
          : [square.lowZ - (this.squareSize * 2), square.upZ -(this.squareSize * 2)]
      })
    )
  
  }

  /**
   * Load FBX files for trees
   */
  loadTreesFile(callback) {

    const loaded = []
    const fileNumber = 8

    for (let i = 0; i < fileNumber; i++) {
      
      const fileName = 'trees/forest' + (i + 1) + '.fbx'
      
      this.fbx(fileName, (object) => {
        loaded.push(object)
        loaded.length === fileNumber ? callback() : null
      })
    }
  }

  /**
   * Load FBX files for buildings
   */
  loadBuildingsFile(callback) {

    const loaded = []
    const fileName = 'buildings/buildings.fbx'
      
    this.fbx(fileName, (object) => {
      loaded.push(object)
      callback()
    })
  }

  /**
   * Create random trees around the user
   */
  addRandomTree(coordinates) {

    const treeNumber = Math.random() * (8 - 1) + 1
    const fileName = 'trees/forest' + (parseInt(treeNumber) + 1) + '.fbx'
    
    const tree = this.loadedObject[ fileName ].clone()
    
    tree.scale.set(0.004,0.004,0.004)
    
    this.setRandomPosition(tree, coordinates)    
  }

  addRandomBuilding(coordinates) {
    
    const fileName = 'buildings/buildings.fbx'
    const buildings = this.loadedObject[ fileName ].clone()

    const buildingNumber = Math.random() * (buildings.children.length - 1) + 1
    const building = buildings.children[ parseInt(buildingNumber) ] 

    building.scale.set(0.1, 0.1, 0.1)
    
    this.setCenterPosition(building, coordinates)   
  }

  loadCar(callback) {
    this.fbx('car/Car.fbx', car => callback(car))
  }

  /**
   * TODO: Handle car in separte file 
   */
  addCar(coordinates) {

    // Only one car at once to avoid too much objects
    if( this.carNumber >= this.maxCarNumber ) return;

    this.carNumber = this.carNumber + 1

    // No need to clone because always same car
    const fileName = 'car/Car.fbx'
    const car = this.loadedObject[ fileName ].clone()
    
    car.scale.set(0.012, 0.012, 0.012)
    
    // Chose a direction so that the care we come to the user
    car.direction = Math.floor(Math.random() * 4) + 1

    console.info( 'One car has been added. Current Car number is: ' + this.carNumber + ', direction is ' + car.direction )

    switch(car.direction) {

      case 1:
        car.rotation.y = Math.PI / 2

        car.position.x = coordinates.x[0]
        car.position.z = coordinates.z[0] + 4.5
        break;

      case 2:
        car.rotation.y = -Math.PI / 2

        car.position.x = coordinates.x[1]
        car.position.z = coordinates.z[1] - 4.5
        break;

      case 3:
        car.rotation.y = 0

        car.position.x = coordinates.x[0] - 4.5
        car.position.z = coordinates.z[0] 
        break;

      case 4:
        car.rotation.y = -Math.PI

        car.position.x = coordinates.x[1] + 4.5
        car.position.z = coordinates.z[1] 
        break;
    }

    this.scene.add(car)

    const carMovement = setInterval(() => {

      switch(car.direction) {
        case 1: car.position.x = car.position.x + 0.5; break;
        case 2: car.position.x = car.position.x - 0.5; break;
        case 3: car.position.z = car.position.z + 0.5; break;
        case 4: car.position.z = car.position.z - 0.5; break;
      }

      const characterVector = new THREE.Vector3( 
        this.character.object.position.x,
        this.character.object.position.y,  
        this.character.object.position.z 
      )

      const carVector = new THREE.Vector3(
        car.position.x, 
        car.position.y, 
        car.position.z
      )

      // If car is far or if it reach a non generated square
      if( carVector.distanceTo(characterVector) > 200 || !this.squareExists(car.position.x, car.position.z)) {

        clearInterval(carMovement)
        
        this.scene.remove(car)

        this.carNumber = this.carNumber - 1

        console.info( 'One car has been removed. Current Car number is: ' + this.carNumber )
      }

    }, 20)

  }

  setRandomPosition(object, coordinates) {
    
    this.scene.add(object)

    // We don't wan to add anything on the road
    const innerSquare = {
      x: [
        coordinates.x[0] + (this.roadSize / 2), 
        coordinates.x[1] - (this.roadSize / 2) 
      ],
      z: [
        coordinates.z[0] + (this.roadSize / 2), 
        coordinates.z[1] - (this.roadSize / 2) 
      ]
    }

    /**
     * @see https://stackoverflow.com/a/67746339/10491705
     */
    const positionX = Math.floor(Math.random() * (innerSquare.x[1] - innerSquare.x[0] + 1)) + innerSquare.x[0]
    const positionZ = Math.floor(Math.random() * (innerSquare.z[1] - innerSquare.z[0] + 1)) + innerSquare.z[0]

    object.position.x = positionX 
    object.position.z = positionZ 
    object.position.y = -0.2

    const isCollision = this.isCollision(object)

    isCollision
      ? this.scene.remove(object.name)
      : this.worldObjects.push(object)

    // Check if collision with character (should find a better way to do this)
    if( this.isCollision(this.character.object) ) {
      this.scene.remove(object.name)
      this.worldObjects.pop(object)
    }
  }

  setCenterPosition(object, coordinates) {

    this.scene.add(object)

    object.position.x = coordinates.x[1] - (this.squareSize / 2) 
    object.position.z = coordinates.z[1] - (this.squareSize / 2) 
    object.position.y = -0.2

    this.worldObjects.push(object)
  }

  render() {

    if(this.character && this.characterCamera) {
      this.character.render(this.clock)
      this.characterCamera.render()    
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

    this.scene.add(hemiLight)
    this.scene.add(sideLight)
  }

  sky = () => this.scene.background = new THREE.Color( 0x55BBFF )

  fbx = async (name, callback = false) => {

    // Already loaded
    if(this.loadedObject[ name ]) return callback ? callback(this.loadedObject[ name ]) : null
    
    return this.loader.fbx.load(this.objectPath + name,
      (fbx) => {
        
        this.loadedObject[ name ] = fbx

        fbx.castShadow    = true
        fbx.receiveShadow = true
        
        if(callback) callback(fbx)
      },
      (xhr) => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
      (error) => console.log('An error happened')
    )
  }

  obj = async (name, callback = false, texture = false) => {
    
    if(this.loadedObject[ name ]) return callback ? callback(this.loadedObject[ name ]) : null
  
    return this.loader.obj.load(this.objectPath + name, obj => {
      
        this.loadedObject[ name ] = obj

        obj.castShadow    = true
        obj.receiveShadow = true
        
        if(callback) callback(obj)
      },
      (xhr) => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
      (error) => console.log('An error happened')
    )    
  }

  mtl = async (name, callback = false) => {

    if(this.loadedObject[ name ]) return callback ? callback(this.loadedObject[ name ]) : null

    return this.loader.mtl.load(this.objectPath + name, mtl => {
      
        mtl.preload()
        this.loader.obj.setMaterials( mtl )
        
        this.loadedObject[ name ] = mtl

        mtl.castShadow    = true
        mtl.receiveShadow = true

        if(callback) callback(mtl)
      },
      (xhr) => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
      (error) => console.log('An error happened')
    )
  }

}
