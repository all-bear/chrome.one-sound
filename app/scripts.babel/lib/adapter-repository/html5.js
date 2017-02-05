import {Adapter} from '../adapter';

const TYPE = 'html5';
export class Html5AdapterRepository {
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
        let isPlayTriggeredProgrammatically = false;
        let isPauseTriggeredProgrammatically = false;

        return new Adapter({
          type: TYPE,
          behavior: {
            getLabel: () => document.location.href,
            play: () => {
              isPlayTriggeredProgrammatically = true;
              el.play();
            },
            pause: () => {
              isPauseTriggeredProgrammatically = true;
              el.pause();
            },
            isPlayed: () => !el.paused,
            registerChangeListener: cb => {
              el.addEventListener('play', () => {
                if (isPlayTriggeredProgrammatically) {
                  isPlayTriggeredProgrammatically = false;

                  return;
                }

                cb.call();
              });
              el.addEventListener('pause', () => {
                if (isPauseTriggeredProgrammatically) {
                  isPauseTriggeredProgrammatically = false;

                  return;
                }

                cb.call();
              });
            }
          }
        });
      }));
    });
  }
}