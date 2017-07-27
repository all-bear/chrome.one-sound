import {Html5AdapterRepository} from './html5';
import {YandexMusicAdapterRepository} from './yandex-music';
import {VkAudioAdapterRepository} from './vk/audio';
import {VkVideoAdapterRepository} from './vk/video';
import {YoutubeAdapterRepository} from './youtube';
import {SoundCloudAdapterRepository} from './sound-cloud';
import {transport} from '../transport';

class AdapterRepository {
  constructor () {
    this.repositories = [
      new Html5AdapterRepository(),
      new YandexMusicAdapterRepository(),
      new VkAudioAdapterRepository(),
      new VkVideoAdapterRepository(),
      new YoutubeAdapterRepository(),
      new SoundCloudAdapterRepository()
    ];

    this.repositoryAdapters = this.repositories.reduce((basket, repository) => {
      basket[repository.type] = [];

      return basket;
    }, {});

  }

  process(repository, adapter) {
    adapter.register();
    this.repositoryAdapters[repository.type].push(adapter);
  }

  load(repository) {
    this.destroy(repository);

    repository.adapters.then(adapters => {
      adapters.forEach(adapter => {
        this.process(repository, adapter);
      });
    }).catch(reason => {
      throw reason;
    });

    if (repository.onLoad) {
      repository.onLoad(this);
    }
  }

  destroy(repository) {
    this.repositoryAdapters[repository.type].forEach(adapter => adapter.destroy());
    this.repositoryAdapters[repository.type] = [];
  }

  isApplied(repository) {
    const isForSpecificLocations = (repository) => Array.isArray(repository.locations);

    const isExactlyForCurrentLocation = (repository) => {
      return isForSpecificLocations(repository) &&
        repository.locations.some(location => (new RegExp(location)).test(window.location.hostname))
    };

    if (isExactlyForCurrentLocation(repository)) {
      return true;
    }

    if (!isForSpecificLocations(repository) && !this.repositories.find(isExactlyForCurrentLocation)) {
      return true;
    }

    return false;
  }

  init() {
    this.repositories.forEach(repository => {
      if (!this.isApplied(repository)) {
        return;
      }

      repository.loadOn(() => {
        this.load(repository);
      });

      repository.destroyOn(() => {
        this.destroy(repository);
      });
    });
  }

  /**
   * Check is all adapters in chain are alive, if some of them are died remove them from query
   */
  redraw() {
    transport.send('redraw-adapters', this);
  }
}

export let repository = new AdapterRepository();