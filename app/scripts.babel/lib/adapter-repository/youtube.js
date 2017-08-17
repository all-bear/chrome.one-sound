import {Adapter} from '../adapter';
import {Html5AdapterBehaviour} from './html5';
import {Html5AjaxAdapterRepository} from './html5ajax';

export class YoutubeAdapterBehaviour extends Html5AdapterBehaviour {
  get isAutoplayEnabled() {
    const checkbox = document.getElementById('autoplay-checkbox');

    return checkbox && checkbox.checked;
  }

  get isEndedMode() {
    const player = document.getElementById('movie_player');

    return player && player.classList.contains('ended-mode')
  }

  get isPlayed() {
    return super.isPlayed || (this.isEndedMode && this.isAutoplayEnabled);
  }
}

const TYPE = 'youtube';
const YOUTUBE_LOCATION = 'www.youtube.com';
export class YoutubeAdapterRepository extends Html5AjaxAdapterRepository {
  get type() {
    return TYPE;
  }

  getAdapter(element) {
    return new Adapter({
      type: TYPE,
      behavior: new YoutubeAdapterBehaviour(element)
    });
  }

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
}