import {Html5AdapterRepository} from './html5';
import {YandexMusicAdapterRepository} from './yandex-music';
import {VkAdapterRepository} from './vk';

class AdapterRepository {
  constructor () {
    this.repositories = [
      new Html5AdapterRepository(),
      new YandexMusicAdapterRepository(),
      new VkAdapterRepository()
    ];
  }

  init() {
    const pateAdapters = [];

    this.repositories.forEach(repository => {
      repository.adapters.then(adapters => {
        adapters.forEach(adapter => {
          adapter.register();
          pateAdapters.push(adapter);
        });
      }).catch(reason => {
        throw reason;
      });
    });

    window.onbeforeunload = (() => {
      var oldUnload = window.onbeforeunload;

      return () => {
        pateAdapters.forEach(adapter => adapter.destroy());

        oldUnload.call(window);
      };
    })();
  }
}

export let repository = new AdapterRepository();