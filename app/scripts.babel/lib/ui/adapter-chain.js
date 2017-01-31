import {transport} from '../transport';
import {I18n} from '../helper/i18n';
import {DEFAULT_SETTINGS} from '../helper/default-settings'

class AdapterChainUi {
  constructor() {
    this.transport = transport;
    this.chain = [];
  }

  init() {
    I18n.render();

    this.holder = document.getElementById('chain-holder');
    this.placeholder = '<div class="empty-query-placeholder">' + document.getElementById('if-empty-query').innerHTML + '</div>';

    this.reloadChain();
    this.initSkin();
  }

  initSkin() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, opts => {
      document.getElementsByTagName('html')[0].className += 'skin-' + opts.skin;
    });
  }

  static renderAdapter(adapter) {
    var template = document.getElementById('chain-template').innerHTML;

    ['label', 'id'].forEach(param => {
        template = template.replace(new RegExp('{{' + param + '}}', 'g'), adapter[param]);
    });

    return template;
  }

  reloadChain() {
    this.transport.send('get-chain', {}, false, chain => {
      let template = '';

      if (chain.length) {
        chain.forEach(adapter => {
          template += AdapterChainUi.renderAdapter(adapter);
        });
      } else {
        template = this.placeholder;
      }

      this.holder.innerHTML = template;

      this.holder.querySelectorAll('[data-role="remove"]').forEach(btn => {
        var adapterId = btn.getAttribute('data-id'),
          adapter = chain.find(adapter => adapterId === adapter.id);

        btn.onclick = function () {
          transport.send('remove-adapter', adapter);
        };
      });

      this.holder.querySelectorAll('[data-role="play"]').forEach(btn => {
        var adapterId = btn.getAttribute('data-id'),
          adapter = chain.find(adapter => adapterId === adapter.id);

        btn.onclick = function () {
          transport.send('add-adapter', adapter)
        };
      });
    });
  }
}

export let chainUi = new AdapterChainUi();