import {Adapter} from '../adapter';
import {AbstractAdapterRepository} from './abstract';

export class Html5AdapterBehaviour {
  constructor(element) {
    this.element = element;
    this.isPlayTriggeredProgrammatically = false;
    this.isPauseTriggeredProgrammatically = false;
  }

  get label() {
    return document.title;
  }

  play() {
    this.isPlayTriggeredProgrammatically = true;
    this.element.play();
  }

  pause() {
    this.isPauseTriggeredProgrammatically = true;
    this.element.pause();
  }

  get isPlayed() {
    return !this.element.paused;
  }

  registerChangeListener(cb) {
    this.element.addEventListener('play', () => {
      if (this.isPlayTriggeredProgrammatically) {
        this.isPlayTriggeredProgrammatically = false;

        return;
      }

      cb.call();
    });
    this.element.addEventListener('pause', () => {
      if (this.isPauseTriggeredProgrammatically) {
        this.isPauseTriggeredProgrammatically = false;

        return;
      }

      cb.call();
    });
    this.element.addEventListener('loadstart', cb);
    this.element.addEventListener('seeking', cb);
  }
}

const TYPE = 'html5';
export class Html5AdapterRepository extends AbstractAdapterRepository {
  htmlCollectionToArray(collection) {
    return [].map.call(collection, function (el) {
      return el;
    })
  }

  get playerDomElements() {
    return []
      .concat(this.htmlCollectionToArray(document.getElementsByTagName('video')))
      .concat(this.htmlCollectionToArray(document.getElementsByTagName('audio')));
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