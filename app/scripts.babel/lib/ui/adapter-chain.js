import {transport} from '../transport';
import {InlineI18n} from '../../../bower_components/chrome-lib-inline-i18n/dist/js/i18n';
import {Settings} from '../../../bower_components/chrome-lib-settings/dist/js/settings'

class AdapterChainUi {
  constructor() {
    this.transport = transport;
    this.chain = [];
  }

  init() {
    InlineI18n.render();

    this.holder = document.getElementById('chain-holder');
    this.placeholder = '<div class="empty-query-placeholder">' + document.getElementById('if-empty-query').innerHTML + '</div>';

    this.reloadChain();
    this.initSkin();

    this.transport.on('update-adapter', this.reloadChain.bind(this));
  }

  initSkin() {
    Settings.load(settings => {
      document.getElementsByTagName('html')[0].className += 'skin-' + settings.skin;
    });
  }

  static renderAdapter(adapter) {
    var template = document.getElementById('chain-template').innerHTML;

    ['label', 'id'].forEach(param => {
        template = template.replace(new RegExp('{{' + param + '}}', 'g'), adapter[param]);
    });

    return template;
  }

  renderChain(chain) {
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

      btn.onclick = () => {
        transport.send('disable-adapter', adapter, false, this.reloadChain.bind(this));
      };
    });

    this.holder.querySelectorAll('[data-role="play"]').forEach(btn => {
      var adapterId = btn.getAttribute('data-id'),
        adapter = chain.find(adapter => adapterId === adapter.id);

      btn.onclick = () => {
        transport.send('add-adapter', adapter, false, this.reloadChain.bind(this));
      };
    });
  }

  reloadChain() {
    this.transport.send('get-chain', {}, false, this.renderChain.bind(this));
  }
}

export let chainUi = new AdapterChainUi();