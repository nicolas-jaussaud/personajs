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
    this.loadedMap = []
    this.mapSize = 50

    this.init()
  }

  async init() {
      
    this.fbx('character.fbx', (character) => {
      
      this.character = new Character(character, this.scene)
      character.scale.set(0.002,0.002,0.002)
      
      this.scene.add(character)
  
      this.characterCamera = new Camera(this.camera, this.character)
    })

    this.floor()
    this.light()
    this.trees()
    this.sky()
  }

  floor() {
  
    const geometry  = new THREE.PlaneGeometry( 8000, 8000 )
    const material  = new THREE.MeshBasicMaterial( {color: 0x55ff66, side: THREE.DoubleSide} );
    const plane     = new THREE.Mesh( geometry, material )

    this.scene.add(plane);

    plane.rotation.x = Math.PI / 2
  }

  trees() {

    this.loadMap(0, 0)

    // CHeck if we load more tree according to user position
    setInterval(() => this.shouldLoadTree(), 1000)
  }

  loadMap(x, z) {

    this.loadedMap[ x + '-' + z ] = true

    this.loadTreesFile(() => {
      for (let i = 0; i < 25; i++) this.addTree(x, z)
    })
  }

  shouldLoadTree() {
    
    const currentX = this.character.object.position.x
    const currentZ = this.character.object.position.z
    
    const mapX = Math.ceil(currentX / 50) * 50
    const mapZ = Math.ceil(currentZ / 50) * 50

    const mapName = mapX + '-' + mapZ
    
    if( this.loadedMap[ mapName ]) return;

    this.loadMap(mapX, mapZ)
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
  addTree(x, z) {

    const treeNumber = Math.random() * (8 - 1) + 1
    const fileName = 'trees/forest' + (parseInt(treeNumber) + 1) + '.fbx'
    
    const tree = this.loadedObject[ fileName ].clone()
    
    tree.scale.set(0.004,0.004,0.004)
    
    this.setRandomPosition(tree, x, z)    
  }

  setRandomPosition(object, x, z) {

    this.scene.add(object)
    
    const maxX = x + this.mapSize
    const minX = x - this.mapSize
    const maxZ = z + this.mapSize
    const minZ = z - this.mapSize

    const positionX = Math.random() * (maxX - minX) + minX
    const positionZ = Math.random() * (maxZ + minZ) + minZ

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
