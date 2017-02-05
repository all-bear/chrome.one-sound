import {Adapter} from '../adapter';
import {UniqId} from '../helper/uniq-id';
import {ScriptInjection} from '../helper/script-injection';

const EVENT_TYPE = 'ONE_SOUND_YANDEX_MUSIC_ADAPTER';
class YandexExternalApi {
  addTrackEventListener(cb) {
    var eventId = UniqId.generate(EVENT_TYPE);

    ScriptInjection.execute(
      `((function () {
        externalAPI.on(externalAPI.EVENT_TRACK, function() {
          window.postMessage({id: "${eventId}" }, "*");
        });
      })())`
    );

    window.addEventListener('message', function(event) {
      if (event.source != window) {
        return;
      }

      if (event.data.type && event.data.type == EVENT_TYPE && event.data.id == eventId) {
        cb.call();
      }
    }, false);
  }

  addStateEventListener(cb) {
    var eventId = UniqId.generate(EVENT_TYPE);

    ScriptInjection.execute(
      `((function () {
        var prevState,
            stateNeedHandle = false;

        function getState() {
          return externalAPI.isPlaying();
        }
        function isStateChanged() {
          return prevState != getState();
        };
        function updateState() {
          prevState = getState();
        }

        updateState();

        setInterval(function () {
          stateNeedHandle = stateNeedHandle || isStateChanged();
          updateState();
        }, 300);

        externalAPI.on(externalAPI.EVENT_STATE, function() {
          if (stateNeedHandle || isStateChanged()) {
            window.postMessage({state:externalAPI.isPlaying(), id: "${eventId}" }, "*");

            stateNeedHandle = false;
            updateState();
          }
        });
      })())`
    );

    window.addEventListener('message', function(event) {
      if (event.source !== window) {
        return;
      }

      if (event.data.id === eventId) {
        cb.call();
      }
    }, false);
  }

  get currentTrack() {
    return JSON.parse(ScriptInjection.execute('JSON.stringify(externalAPI.getCurrentTrack())'));
  }

  togglePause(status) {
    ScriptInjection.execute(`externalAPI.togglePause(${status})`);
  }

  isPlaying() {
    return ScriptInjection.execute('externalAPI.isPlaying()') === 'true';
  }
}

const TYPE = 'yandex-music';
const LOCATION = 'music.yandex.ua';
export class YandexMusicAdapterRepository {
  get adapters() {
    return new Promise((resolve, reject) => {
      if (location.hostname !== LOCATION) {
        resolve([]);
      }


      resolve([(() => {
        const api = new YandexExternalApi();

        return new Adapter({
          type: TYPE,
          behavior: {
            getLabel: () => {
              const trackInfo = api.currentTrack;

              return trackInfo ?  trackInfo.artists[0].title + ' - ' + trackInfo.title : '';
            },
            play: () => {
              api.togglePause(false);
            },
            pause: () => {
              api.togglePause(true);
            },
            isPlayed: () => {
              return api.isPlaying();
            },
            registerChangeListener: cb => {
              api.addStateEventListener(cb);
              api.addTrackEventListener(cb);
            }
          }
        });
      })()]);
    });
  }
}