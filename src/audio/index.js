const audioFolder = '../audio/'
const songs =[]

export const init = () => randomlyStartSong()

export const getSong = name => (
  songs[ name ] 
    ? songs[ name ]
    : songs[ name ] = new Audio(audioFolder + name + '.mp3')
)

/**
 * Every 10 seconds, one chance out of five to start the song
 */
const randomlyStartSong = () => {
  
  const maybeStartSong = setInterval(() => {
    console.log(songs)
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
