import { app } from '../app'

export const fbx = async (name, callback = false) => (
  app.loaders.fbx.load(app.objectPath + name,
    fbx => {
      
      app.objects[ name ] = fbx

      fbx.castShadow    = true
      fbx.receiveShadow = true
      
      if(callback) callback(fbx)
    },
    xhr   => app.debug ? console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ) : '',
    error => app.debug ? console.error('An error happened: ' + error) : ''
  )
)

export const obj = async (name, callback = false) => (
  app.loaders.obj.load(app.objectPath + name, 
    obj => {
    
      app.objects[ name ] = obj

      obj.castShadow    = true
      obj.receiveShadow = true
      
      if(callback) callback(obj)
    },
    xhr   => app.debug ? console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ) : '',
    error => app.debug ? console.error('An error happened: ' + error) : ''
  )    
)

export const mtl = async (name, callback = false) => (
  app.loaders.mtl.load(app.objectPath + name, 
    mtl => {
    
      mtl.preload()
      app.loaders.obj.setMaterials( mtl )
      
      app.objects[ name ] = mtl

      mtl.castShadow    = true
      mtl.receiveShadow = true

      if(callback) callback(mtl)
    },
    xhr   => app.debug ? console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' ) : '',
    error => app.debug ? console.error('An error happened: ' + error) : ''
  )
)
