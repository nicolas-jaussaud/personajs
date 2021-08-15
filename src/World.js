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

    this.carNumber = 0
    this.maxCarNumber = 2

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

    // Initial user square
    this.loadSquareMap({
      x: [-(this.squareSize / 2), this.squareSize / 2],
      z: [-(this.squareSize / 2), this.squareSize / 2]
    }, true)

    // Check if we load more tree according to user position
    setInterval(() => this.shouldLoadSquare(), 500)
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

    // First square has to be empty
    if( firstSquare ) return;

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

    this.loadCar(() => this.addCar(coordinates))

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
     * Make the 8 square around current one are loaded
     */

    // 3 squares with lower X position 
    this.loadSquareMap({
      x: [square.lowX - this.squareSize, square.upX - this.squareSize],
      z: [square.lowZ, square.upZ],
    })
    this.loadSquareMap({
      x: [square.lowX - this.squareSize, square.upX - this.squareSize],
      z: [square.lowZ + this.squareSize, square.upZ + this.squareSize],
    })
    this.loadSquareMap({
      x: [square.lowX - this.squareSize, square.upX - this.squareSize],
      z: [square.lowZ - this.squareSize, square.upZ - this.squareSize],
    })
    
    // 2 squares with same X position 
    this.loadSquareMap({
      x: [square.lowX, square.upX],
      z: [square.lowZ + this.squareSize, square.upZ + this.squareSize],
    })
    this.loadSquareMap({
      x: [square.lowX, square.upX],
      z: [square.lowZ - this.squareSize, square.upZ - this.squareSize],
    })
    
    // 3 squares with upper X position 
    this.loadSquareMap({
      x: [square.lowX + this.squareSize, square.upX + this.squareSize],
      z: [square.lowZ, square.upZ],
    })
    this.loadSquareMap({
      x: [square.lowX + this.squareSize, square.upX + this.squareSize],
      z: [square.lowZ + this.squareSize, square.upZ + this.squareSize],
    })
    this.loadSquareMap({
      x: [square.lowX + this.squareSize, square.upX + this.squareSize],
      z: [square.lowZ - this.squareSize, square.upZ - this.squareSize],
    })
    
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
    this.mtl('car/Low_Poly_Sportcar.mtl', texture => {
      this.obj('car/Low_Poly_Sportcar.obj', car => callback(car))
    })
  }

  /**
   * TODO: Handle car in separte file 
   */
  addCar(coordinates) {

    // Only one car at once to avoid too much objects
    if( this.carNumber >= this.maxCarNumber ) return;

    this.carNumber = this.carNumber + 1

    // No need to clone because always same car
    const fileName = 'car/Low_Poly_Sportcar.obj'
    const car = this.loadedObject[ fileName ]

    car.scale.set(0.01, 0.01, 0.01)
    
    // Chose a direction so that the care we come to the user
    car.direction = Math.floor(Math.random() * 4) + 1
    car.position.y = 0.9

    console.info( 'One car has been added. Current Car number is: ' + this.carNumber + ', direction is ' + car.direction )

    switch(car.direction) {

      case 1:
        car.rotation.y = 0

        car.position.x = coordinates.x[0]
        car.position.z = coordinates.z[0] + 4.5
        break;

      case 2:
        car.rotation.y = Math.PI

        car.position.x = coordinates.x[1]
        car.position.z = coordinates.z[1] - 4.5
        break;

      case 3:
        car.rotation.y = -Math.PI / 2

        car.position.x = coordinates.x[0] - 4.5
        car.position.z = coordinates.z[0] 
        break;

      case 4:
        car.rotation.y = Math.PI / 2

        car.position.x = coordinates.x[1] + 4.5
        car.position.z = coordinates.z[1] 
        break;
    }

    this.scene.add(car)

    const carMovement = setInterval(() => {
      
      switch(car.direction) {
        case 1: car.position.x = car.position.x + 1; break;
        case 2: car.position.x = car.position.x - 1; break;
        case 3: car.position.z = car.position.z + 1; break;
        case 4: car.position.z = car.position.z - 1; break;
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

    }, 30)

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
