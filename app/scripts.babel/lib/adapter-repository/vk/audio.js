import {Adapter} from '../../adapter';
import {ScriptInjection} from '../../../../bower_components/chrome-lib-script-injection/dist/js/script-injection';
import {Html5AdapterBehaviour} from '../html5';
import {AbstractVkAdapterRepository} from './abstract';

class VkAudioExternalApi {
  get isReady() {
    return ScriptInjection.execute('typeof getAudioPlayer !== \'undefined\'') === 'true';
  }

  get audioElement() {
    ScriptInjection.execute('document.body.appendChild(getAudioPlayer()._impl._currentAudioEl)');

    return window.document.getElementsByTagName('audio')[0];
  }

  get currentAudio() {
    return JSON.parse(ScriptInjection.execute('JSON.stringify(getAudioPlayer().getCurrentAudio())'));
  }
}

class VkAudioAdapterBehaviour extends Html5AdapterBehaviour {
  constructor(api) {
    super(api.audioElement);

    this.api = api;
  }

  get label() {
    const trackInfo = this.api.currentAudio;

    return trackInfo ? trackInfo[4] + ' - ' + trackInfo[3] : '';
  }
}

const TYPE = 'vk-audio';
export class VkAudioAdapterRepository extends AbstractVkAdapterRepository {
  get type() {
    return TYPE;
  }

  get adapters() {
    return new Promise((resolve, reject) => {
      const AudioApi = new VkAudioExternalApi();
      const interval = setInterval(() => {
        if (!AudioApi.isReady) {
          return;
        }

        clearInterval(interval);

        resolve([
          new Adapter({
            type: TYPE,
            behavior: new VkAudioAdapterBehaviour(AudioApi)
          })
        ]);
      }, 100);
    });
  }
}