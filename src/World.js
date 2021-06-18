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
    
    this.cubes = []
    
    this.init()
  }

  async init() {
      
    this.fbx('character.fbx', (character) => {

      this.character = new Character(character, this.scene)
      character.scale.set(0.002,0.002,0.002)
      
      character.castShadow = true;
      character.receiveShadow = true;
  
      this.characterCamera = new Camera(this.camera, this.character)
    })

    this.floor()
    this.buildings() // This is just cubes for now
    this.light()
    this.sky()
  }

  floor() {
  
    const geometry  = new THREE.PlaneGeometry( 8000, 8000 );
    const material  = new THREE.MeshBasicMaterial( {color: 0x55ff66, side: THREE.DoubleSide} );
    const plane     = new THREE.Mesh( geometry, material );

    this.scene.add(plane);

    plane.rotation.x = Math.PI / 2
  }

  buildings() {
    [10,20,30,40,50,60,70,80,90,100].map((position) => {
      this.cube( position, position)
      this.cube( position,-position)
      this.cube(-position,-position)
      this.cube(-position, position)
    })
  }

  cube(x, z) {

    const geometry  = new THREE.BoxGeometry(5, 10, 5)
    const material  = new THREE.MeshStandardMaterial({color: 0x333311})
    const mesh      = new THREE.Mesh(geometry, material)

    mesh.position.x = x
    mesh.position.z = z
    mesh.position.y = 0

    mesh.shading = THREE.FlatShading
    mesh.castShadow = true
    mesh.receiveShadow = true
    
    this.cubes.push(mesh) 
    
    this.scene.add(mesh)
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

    this.cubes.map(cube => {

      const cubeHitBox = new THREE.Box3().setFromObject(cube)
      const collision = objectHitBox.intersectsBox(cubeHitBox)

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

  fbx = (name, callback = false) => (
    this.loader.fbx.load(this.objectPath + name,
      (fbx) => {
        this.scene.add(fbx)
        if(callback) callback(fbx)
      },
      (xhr) => console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ),
      (error) => console.log('An error happened')
    )
  )

}
