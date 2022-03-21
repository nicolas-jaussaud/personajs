import Stats from 'stats.js'
import { app } from './app'

/**
 * Display performance stats
 * 
 * @see https://github.com/mrdoob/stats.js/
 */

const init = () => {

  app.stats = new Stats()
  app.stats.showPanel(0)
  
  app.stats.dom.setAttribute('class', 'debug-info')
  document.body.appendChild(app.stats.dom)

}

export { init }
