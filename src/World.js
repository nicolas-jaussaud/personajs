class World {

  constructor(app) {

    this.loader =  {
      fbx: new THREE.FBXLoader()
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
     * 5/6 time it's a bulding square, otherwise a park square
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

  shouldLoadSquare() {
    
    // If character not loaded yet, position will be 0
    const currentX = this.character !== false ? this.character.object.position.x : 0
    const currentZ = this.character !== false ? this.character.object.position.z : 0

    // Get current square coordinate (need to add half square size because first square is centered on 0)
    const upX = ( Math.ceil(currentX / this.squareSize) * this.squareSize ) + this.squareSize / 2
    const upZ = ( Math.ceil(currentZ / this.squareSize) * this.squareSize ) + this.squareSize / 2
    
    const lowX = upX - this.squareSize
    const lowZ = upZ - this.squareSize

    console.info('Current square is: ' + lowX + ' ' + upX + ' ' + lowZ + ' ' + upZ)

    /**
     * Make the 8 square around current one are loaded
     */

    // 3 squares with lower X position 
    this.loadSquareMap({
      x: [lowX - this.squareSize, upX - this.squareSize],
      z: [lowZ, upZ],
    })
    this.loadSquareMap({
      x: [lowX - this.squareSize, upX - this.squareSize],
      z: [lowZ + this.squareSize, upZ + this.squareSize],
    })
    this.loadSquareMap({
      x: [lowX - this.squareSize, upX - this.squareSize],
      z: [lowZ - this.squareSize, upZ - this.squareSize],
    })
    
    // 2 squares with same X position 
    this.loadSquareMap({
      x: [lowX, upX],
      z: [lowZ + this.squareSize, upZ + this.squareSize],
    })
    this.loadSquareMap({
      x: [lowX, upX],
      z: [lowZ - this.squareSize, upZ - this.squareSize],
    })
    
    // 3 squares with upper X position 
    this.loadSquareMap({
      x: [lowX + this.squareSize, upX + this.squareSize],
      z: [lowZ, upZ],
    })
    this.loadSquareMap({
      x: [lowX + this.squareSize, upX + this.squareSize],
      z: [lowZ + this.squareSize, upZ + this.squareSize],
    })
    this.loadSquareMap({
      x: [lowX + this.squareSize, upX + this.squareSize],
      z: [lowZ - this.squareSize, upZ - this.squareSize],
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

}
