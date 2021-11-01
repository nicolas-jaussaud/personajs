import { fbx, obj, mtl } from './loaders'
import { app } from '../app'

export const init = () => {

  app.objectPath = './objects/'
  app.objects = {}

  app.load = load
  
  app.loaders =  {
    fbx: new THREE.FBXLoader(),
    mtl: new THREE.MTLLoader(),
    obj: new THREE.OBJLoader(),
  }

} 

const load = async (name, callback) => {

  if(app.objects[ name ]) return callback ? callback(app.objects[ name ]) : null

  const fileExtension = name.split('.').pop()

  switch(fileExtension) {
    case 'fbx': return fbx(name, callback)
    case 'obj': return obj(name, callback)
    case 'mtl': return mtl(name, callback)
  }
  
} 
