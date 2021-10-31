const audioFolder = './audio/'
const songs =[]

export const init = () => randomlyStartSong()

export const getSong = name => {
  
  if( songs[ name ] ) return songs[ name ]

  const audio = new Audio(audioFolder + name + '.mp3') 
  audio.type = 'audio/mp3'

  return songs[ name ] = audio 
}

/**
 * Every 10 seconds, one chance out of five to start the song
 */
const randomlyStartSong = () => {
  
  const maybeStartSong = setInterval(() => {

    const random = Math.floor(Math.random() * 5)
    if( random !== 3 ) return;

    clearInterval(maybeStartSong)

    const song = getSong('ambiance-song')

    song.volume = 0.01
    song.play()

    const fadeIn = setInterval(() => {
      
      if( song.volume > 0.45 ) clearInterval(fadeIn)

      song.volume = song.volume + 0.01

    }, 1000)

  }, 10000)
}
