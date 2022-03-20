import { app } from './app'

export const render = () => {
    
  // Limit to 24 FPS 
  setTimeout(() => requestAnimationFrame(render), 1000 / 24 );
  
  if(app.debug) app.stats.begin()
  
  // Hook for world events
  app.world.render()
  
  app.renderer.render(app.scene, app.camera)
  
  if(app.debug) app.stats.end()

}

