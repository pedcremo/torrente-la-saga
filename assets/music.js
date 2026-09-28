// Background music settings.
// To use your own song, copy the audio file (mp3 / ogg / m4a) into this "assets"
// folder and put its path below. Leave a value as null to use the game's built-in
// synthesized music.
//
// assets/*.mp3 is git-ignored: songs are not published with the game, so the local
// file is only used when the game runs on this computer (localhost).
const LOCAL = ['localhost', '127.0.0.1', ''].includes(location.hostname);
window.TORRENTE_MUSIC = {
  play: LOCAL ? 'assets/fary.mp3' : null,   // title screen and levels
  fary: LOCAL ? 'assets/fary.mp3' : null,   // El Fary's blessing and reward screens (null = synth)
  volume: 0.6,  // 0.0 – 1.0
};
