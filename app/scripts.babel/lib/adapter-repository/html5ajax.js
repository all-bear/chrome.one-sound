import {Adapter} from '../adapter';
import {Html5AdapterRepository, Html5AdapterBehaviour} from './html5';

const RENDER_PAGE_TIMEOUT = 500;
const CHANGE_URL_TIMEOUT = 100;
const HANDLE_PAGE_LOAD_ATTEMPTS = 15;

const TYPE = 'html5ajax';
export class Html5AjaxAdapterRepository extends Html5AdapterRepository {
  loadOn(cb) {
    super.loadOn(cb);

    let prevHref = window.location.href;
    setInterval(() => {
      if (prevHref === window.location.href) {
        return;
      }

      prevHref = window.location.href;

      let attemptsLeft = HANDLE_PAGE_LOAD_ATTEMPTS;

      const attemptsInterval = setInterval(() => {
        cb();

        if (!attemptsLeft--) {
          clearInterval(attemptsInterval);
        };
      }, RENDER_PAGE_TIMEOUT);
      setTimeout(cb, RENDER_PAGE_TIMEOUT);
    }, CHANGE_URL_TIMEOUT);
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