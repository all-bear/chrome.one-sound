import {html5AdapterRepository} from './html5';

class AdapterRepository {
  constructor () {
    this.repositories = [
      html5AdapterRepository
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