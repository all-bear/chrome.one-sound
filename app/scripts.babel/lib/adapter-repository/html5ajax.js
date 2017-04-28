import {Adapter} from '../adapter';
import {Html5AdapterRepository, Html5AdapterBehaviour} from './html5';

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