import {Adapter} from '../adapter';
import {ScriptInjection} from '../helper/script-injection';
import {Html5AdapterBehaviour} from './html5';
import {AbstractAdapterRepository} from './abstract';

class VkExternalApi {
  get audioElement() {
    ScriptInjection.execute('document.body.appendChild(getAudioPlayer()._impl._currentAudioEl)');

    return window.document.getElementsByTagName('audio')[0];
  }

  get currentAudio() {
    return JSON.parse(ScriptInjection.execute('JSON.stringify(getAudioPlayer().getCurrentAudio())'));
  }
}

class VkAdapterBehaviour extends Html5AdapterBehaviour {
  constructor(api) {
    super(api.audioElement);

    this.api = api;
  }

  get label() {
    const trackInfo = this.api.currentAudio;

    return trackInfo ? trackInfo[4] + ' - ' + trackInfo[3] : '';
  }
}

const TYPE = 'vk';
export class VkAdapterRepository extends AbstractAdapterRepository {
  get locations() {
    return ['vk.com']
  }

  get adapters() {
    return new Promise((resolve, reject) => {
      resolve([
        new Adapter({
          type: TYPE,
          behavior: new VkAdapterBehaviour(new VkExternalApi())
        })
      ]);
    });
  }
}