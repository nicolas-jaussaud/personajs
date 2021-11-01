import { app } from './core/app'
import { render } from './core/render'

import { init as initInterface } from './interface/index.jsx'
import { init as initAudio } from './audio/index.js'

window.onload = () => {

  app.init('#app')

  initInterface()

  initAudio()

  render(app.world)

}
