import {Adapter} from '../adapter';
import {Html5AdapterBehaviour} from './html5';
import {Html5AjaxAdapterRepository} from './html5ajax';

const TYPE = 'youtube';
const YOUTUBE_LOCATION = 'www.youtube.com';
export class YoutubeAdapterRepository extends Html5AjaxAdapterRepository {
  get locations() {
    return [
      YOUTUBE_LOCATION
    ];
  }

  loadOn(cb) {
    super.loadOn(cb);

    if (document.getElementById('player') && !document.querySelector('#player video')) {
      const interval = setInterval(() => {
        if (document.querySelector('#player video')) {
          clearInterval(interval);
          cb();
        }
      }, 500);
    }
  }

  get adapters() {
    return new Promise((resolve, reject) => {
      resolve(this.playerDomElements.map(el => {
        return new Adapter({
          type: TYPE,
          behavior: new Html5AdapterBehaviour(el)
        });
      }));
    });
  }
}