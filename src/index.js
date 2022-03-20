import { app } from './core/app'
import { render } from './core/render'

import { init as initInterface } from './interface/index.jsx'
import { init as initAudio } from './audio/index.js'
import { init as initSquares } from './squares/index.js'
import { init as initStats } from './stats.js'

window.onload = () => {

  if(app.debug) initStats()

  initSquares()

  app.init('#app')

  initInterface()

  initAudio()

  render(app.world)

}


