import {Adapter} from '../adapter';
import {Html5AdapterRepository, Html5AdapterBehaviour} from './html5';

const NEW_ELEMENTS_FIND_INTERVAL = 1000;
const LOCATION_CHANGE_INTERVAL = 500;
const NEW_ELEMENTS_FIND_ATTEMPT = 30;

const TYPE = 'html5ajax';
export class Html5AjaxAdapterRepository extends Html5AdapterRepository {
  getAdapter(element) {
    return new Adapter({
      type: TYPE,
      behavior: new Html5AdapterBehaviour(element)
    });
  }

  onLoad(repositoryAdapter) {
    this.trackedElements = [];
    this.trackedAdapters = [];

    const findAdapters = () => {
      let prevElementsCount = 0;
      let attempts = NEW_ELEMENTS_FIND_ATTEMPT;

      const interval = setInterval(() => {
        this.trackedAdapters.forEach((adapter) => adapter.onChange());
        
        if (!(attempts--)) {
          clearInterval(interval);
          return;
        }

        const elements = this.playerDomElements;

        if (elements.length == prevElementsCount) {
          return;
        }

        if (elements.length <= prevElementsCount) {
          repositoryAdapter.redraw();
          return;
        }

        const newElements = elements.slice(-(elements.length - prevElementsCount));

        newElements.forEach((element) => {
          const isAlreadyUnderTracking = this.trackedElements.find((savedElement) => {return savedElement === element});

          if (isAlreadyUnderTracking) {
            return;
          }

          const adapter = this.getAdapter(element);
          repositoryAdapter.process(this, adapter);

          this.trackedElements.push(element);
          this.trackedAdapters.push(adapter);
        });

        prevElementsCount += newElements.length;
      }, NEW_ELEMENTS_FIND_INTERVAL);
    }

    let prevHref = '';
    setInterval(() => {
      if (prevHref === window.location.href) {
        return;
      }

      prevHref = window.location.href;
      
      this.trackedElements = [];

      repositoryAdapter.destroy(this);
      repositoryAdapter.redraw();

      findAdapters();
    }, LOCATION_CHANGE_INTERVAL);
  }

  get adapters() {
    return new Promise((resolve, reject) => {
      resolve([]);
    });
  }
}