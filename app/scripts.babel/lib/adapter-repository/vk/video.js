import {Adapter} from '../../adapter';
import {ScriptInjection} from '../../../../bower_components/chrome-lib-script-injection/dist/js/script-injection';
import {Html5AdapterBehaviour} from '../html5';
import {AbstractVkAdapterRepository} from './abstract';
import {UniqId} from '../../../../bower_components/uniq-id/dist/js/uniq-id';
import {transport} from '../../transport';
import {repository} from '../index';

const RENDER_CLOSE_OPEN_VIDEO_POPUP_TIMEOUT = 5000;

const EVENT_TYPE = 'ONE_SOUND_VK_VIDEO_ADAPTER';
class VkVideoExternalApi {
  static get isReady() {
    return ScriptInjection.execute('typeof Videoview !== \'undefined\'') === 'true';
  }

  static get videoElement() {
    return window.document.querySelector('#video_player video');
  }

  static get videoTitle() {
    return ScriptInjection.execute('Videoview.getMvData().title');
  }

  static onVideoReinit(cb) {
    var eventId = UniqId.generate(EVENT_TYPE);

    ScriptInjection.execute(
      `((function () {
          var oldOnInitialized = Videoview.playerCallback.onInitialized;
          Videoview.playerCallback.onInitialized = function() {
            window.postMessage({ id: "${eventId}" }, "*");
            oldOnInitialized.apply(Videoview.playerCallback, arguments);
          };

          var oldOnVideoPlayFinished = Videoview.playerCallback.onVideoPlayFinished;
          Videoview.playerCallback.onVideoPlayFinished = function() {
            window.postMessage({ id: "${eventId}" }, "*");
            oldOnVideoPlayFinished.apply(Videoview.playerCallback, arguments);
          };
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
}

class VkVideoAdapterBehaviour extends Html5AdapterBehaviour {
  constructor(api) {
    super(api.videoElement);

    this.api = api;
  }

  get label() {
    return this.api.videoTitle;
  }
}

const TYPE = 'vk-video';
export class VkVideoAdapterRepository extends AbstractVkAdapterRepository {
  get type() {
    return TYPE;
  }

  loadOn(cb) {
    super.loadOn(cb);

    const interval = setInterval(() => {
      if (!VkVideoExternalApi.isReady) {
        return;
      }

      clearInterval(interval);

      VkVideoExternalApi.onVideoReinit(cb);
    }, 100);

    transport.on('play-adapter', adapter => {
      if (!VkVideoExternalApi.videoElement) { //play of external video on vk page
        cb();
      }
    });
  }

  onLoad(repository) {
    const getHref = () => document.referrer || window.location.href;

    let prevHref = getHref();
    setInterval(() => {
      if (prevHref === getHref()) {
        return;
      }

      prevHref = getHref();

      setTimeout(() => {
        repository.redraw();
      }, RENDER_CLOSE_OPEN_VIDEO_POPUP_TIMEOUT);
    }, 100);
  }

  get adapters() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (!VkVideoExternalApi.isReady) {
          return;
        }

        clearInterval(interval);

        resolve(VkVideoExternalApi.videoElement ? [
          new Adapter({
            type: TYPE,
            behavior: new VkVideoAdapterBehaviour(VkVideoExternalApi)
          })
        ] : []);
      }, 100);
    });
  }
}