const dripUrl = "app/media/sounds/75343__neotone__drip1.wav";
const drainUrl = "app/media/sounds/51745__erkanozan__bubbles.wav";
const typewriterUrl =
  "app/media/sounds/240839__videog__typing-on-a-typewriter.wav";

const audioUrls = [
  ["drip", dripUrl],
  ["drain", drainUrl],
  ["typewriter", typewriterUrl],
];

/**
 * Creates an audio tag and attaches it.
 * Returns an object with a play() method to play/replay the sound.
 * @param {String} audioIdUrl
 */
const createAudioTag = (audioIdUrl) => {
  // const [id, url] = audioIdUrl;
  const id = audioIdUrl[0];
  const url = audioIdUrl[1];
  const audio = document.createElement("audio");
  audio.setAttribute("id", "audio-" + id);
  audio.setAttribute("src", url);
  audio.setAttribute("preload", "auto");
  document.body.appendChild(audio);
  console.log("creating " + id);
  console.log(audio);
  let playPromise = null;
  const audioObject = {
    audio: audio,
    play: () => {
      console.log("play " + id);
      if (playPromise && playPromise.then) {
        // https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
        playPromise.then(() => {
          try {
            audio.pause();
            audio.currentTime = 0;
          } catch (e) {
            console.log(e);
          } finally {
            playPromise = audio.play();
          }
        });
      } else {
        playPromise = audio.play();
      }
    },
  };
  return [id, audioObject];
};

export const createAudioTags = () => {
  const audioTags = audioUrls.map(createAudioTag);
  return Object.fromEntries(audioTags);
};
