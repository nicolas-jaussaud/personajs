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
    this.squareSize = 40
    this.threesPerSquare = 3

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
    })

    // Check if we load more tree according to user position
    setInterval(() => this.shouldLoadSquare(), 500)
  }

  createSquareFloor(coordinates) {
  
    const geometry  = new THREE.PlaneGeometry( this.squareSize, this.squareSize )
    const material  = new THREE.MeshBasicMaterial( {color: 0x55ff66, side: THREE.DoubleSide} );
    const square    = new THREE.Mesh( geometry, material )

    this.scene.add(square);

    square.position.x = (coordinates.x[1] + coordinates.x[0]) / 2
    square.position.z = (coordinates.z[1] + coordinates.z[0]) / 2

    square.rotation.x = Math.PI / 2
  }

  loadSquareMap(coordinates) {

    // We don't want to reload this square
    const loadedKey = coordinates.x[0] + '-' + coordinates.x[1] + '-' + coordinates.z[0] + '-' + coordinates.z[1]
    
    if( this.loadedSquare[ loadedKey ] ) return;

    this.loadedSquare[ loadedKey ] = true
    
    this.createSquareFloor(coordinates)

    this.loadTreesFile(() => {
      for (let i = 0; i < this.threesPerSquare; i++) this.addRandomTree(coordinates)
    })

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
   * Create random trees around the user
   */
   addRandomTree(coordinates) {

    const treeNumber = Math.random() * (8 - 1) + 1
    const fileName = 'trees/forest' + (parseInt(treeNumber) + 1) + '.fbx'
    
    const tree = this.loadedObject[ fileName ].clone()
    
    tree.scale.set(0.004,0.004,0.004)
    
    this.setRandomPosition(tree, coordinates)    
  }

  setRandomPosition(object, coordinates) {
    
    this.scene.add(object)

    /**
     * @see https://stackoverflow.com/a/67746339/10491705
     */
    const positionX = Math.floor(Math.random() * (coordinates.x[1] - coordinates.x[0] + 1)) + coordinates.x[0]
    const positionZ = Math.floor(Math.random() * (coordinates.z[1] - coordinates.z[0] + 1)) + coordinates.z[0]

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

    const ambientLight  = new THREE.AmbientLight('rgb(255, 255, 255)', 1)
    const sideLight     = new THREE.DirectionalLight('rgb(255, 255, 150)', 1)
    
    sideLight.position.set(800, 800, 100).normalize()
    sideLight.rotation.x = 0

    this.scene.add(ambientLight)
    this.scene.add(sideLight)
  }

  sky() {
    this.scene.background = new THREE.Color( 0x55BBFF )
  }

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
