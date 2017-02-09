import {Html5AdapterRepository} from './html5';
import {Html5AjaxAdapterRepository} from './html5ajax';
import {YandexMusicAdapterRepository} from './yandex-music';
import {VkAdapterRepository} from './vk';

class AdapterRepository {
  constructor () {
    this.repositories = [
      new Html5AdapterRepository(),
      new Html5AjaxAdapterRepository(),
      new YandexMusicAdapterRepository(),
      new VkAdapterRepository()
    ];

    this.repositoryAdapters = this.repositories.reduce((basket, repository) => {
      basket[repository.type] = [];

      return basket;
    }, {});

  }

  load(repository) {
    this.destroy(repository);

    repository.adapters.then(adapters => {
      adapters.forEach(adapter => {
        adapter.register();
        this.repositoryAdapters[repository.type].push(adapter);
      });
    }).catch(reason => {
      throw reason;
    });
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
}

export let repository = new AdapterRepository();