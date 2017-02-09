import {Adapter} from '../adapter';
import {Html5AdapterRepository, Html5AdapterBehaviour} from './html5';

const TYPE = 'html5ajax';
const YOUTUBE_LOCATION = 'www.youtube.com';
export class Html5AjaxAdapterRepository extends Html5AdapterRepository {
  get locations() {
    return [
      YOUTUBE_LOCATION
    ];
  }

  loadOn(cb) {
    super.loadOn(cb);

    let prevHref = window.location.href;
    setInterval(() => {
      if (prevHref === window.location.href) {
        return;
      }

      prevHref = window.location.href;
      cb();
    }, 100);
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