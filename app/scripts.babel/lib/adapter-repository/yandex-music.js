import {Adapter} from '../adapter';
import {UniqId} from '../../../bower_components/uniq-id/dist/js/uniq-id';
import {ScriptInjection} from '../../../bower_components/chrome-lib-script-injection/dist/js/script-injection';
import {AbstractAdapterRepository} from './abstract';

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

      if (event.data.id == eventId) {
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

  get isPlaying() {
    return ScriptInjection.execute('externalAPI.isPlaying()') === 'true';
  }
}

class YandexMusicAdapterBehaviour {
  constructor(api) {
    this.api = api;
  }

  get label() {
    const trackInfo = this.api.currentTrack;

    return trackInfo ?  trackInfo.artists[0].title + ' - ' + trackInfo.title : '';
  }

  play() {
    this.api.togglePause(false);
  }

  pause() {
    this.api.togglePause(true);
  }

  get isPlayed() {
    return this.api.isPlaying
  }

  registerChangeListener(cb) {
    this.api.addStateEventListener(cb);
    this.api.addTrackEventListener(cb);
  }
}

const TYPE = 'yandex-music';
const MUSIC_LOCATION = 'music.yandex.ua';
const RADIO_LOCATION = 'radio.yandex.ua';
export class YandexMusicAdapterRepository extends AbstractAdapterRepository {
  get locations() {
    return [MUSIC_LOCATION, RADIO_LOCATION];
  }

  get adapters() {
    return new Promise((resolve, reject) => {
      resolve([
        new Adapter({
          type: TYPE,
          behavior: new YandexMusicAdapterBehaviour(new YandexExternalApi())
        })
      ]);
    });
  }
}