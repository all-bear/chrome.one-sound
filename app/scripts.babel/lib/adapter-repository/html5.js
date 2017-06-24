import {Adapter} from '../adapter';
import {AbstractAdapterRepository} from './abstract';

class MouseState {
  constructor() {
    // TODO add tablet support
    document.addEventListener('mousedown', () => {
      this.isPressed = true;
    });

    document.addEventListener('mouseup', () => {
      this.isPressed = false;
    });
  }
}

export class Html5AdapterBehaviour {
  constructor(element) {
    this.element = element;
    this.isPlayTriggeredProgrammatically = false;
    this.isPauseTriggeredProgrammatically = false;
    this.mouseState = new MouseState();
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
    return !this.element.paused || this.element.seeking;
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
      const action = () => {
        if (this.isPauseTriggeredProgrammatically) {
          this.isPauseTriggeredProgrammatically = false;

          return;
        }

        cb.call();
      };

      if (this.mouseState.isPressed) { // prevent pause on seek when mouse is still not raised
        document.addEventListener('mouseup', () => {
          action.call();
        });
      } else if (this.isWaiting) {
        var waitingHandled = false;
        document.addEventListener('playing', () => {
          if (waitingHandled) {
            return;
          }

          waitingHandled = true;
          action.call();
        });
      } else if (this.element.seeking) {
        //NOP
      } else {
        action.call();
      }
    });
    this.element.addEventListener('seeking', () => {
      this.isPauseTriggeredProgrammatically = false;
      cb.call();
    });
    this.element.addEventListener('waiting', () => {
      this.isWaiting = true;
    });
    this.element.addEventListener('playing', () => {
      this.isPauseTriggeredProgrammatically = false;
      this.isWaiting = false;
      cb.call();
    });
  }

  isAlive() {
    return document.body.contains(this.element);
  }
}

const TYPE = 'html5';
export class Html5AdapterRepository extends AbstractAdapterRepository {
  get type() {
    return TYPE;
  }

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