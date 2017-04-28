import {transport} from './transport';

class Chain {
  constructor() {
    this.chain = [];
  }

  push(adapter) {
    if (this.has(adapter)) {
      this.remove(adapter);
    }

    this.chain.push(adapter);
  }

  get length() {
    return this.chain.length;
  }

  find(id) {
    return this.chain.find(adapter => adapter.id === id);
  }

  has(adapter) {
    return this.chain.some(chainAdapter => chainAdapter.id === adapter.id);
  }

  remove(adapter) {
    this.chain = this.chain.filter(chainAdapter => chainAdapter.id !== adapter.id);
  }

  update(adapter) {
    const chainAdapter = this.find(adapter.id);
    if (chainAdapter) {
      chainAdapter.label = adapter.label;
    }
  }

  get last() {
    if (!this.length) {
      throw 'Chain is empty';
    }

    return this.chain[this.chain.length - 1];
  }
}

class AdapterChain {
  constructor() {
    this.chain = new Chain();
    this.transport = transport;
    this.isPlayed = true;
  }

  pause(adapter) {
    this.transport.send('pause-adapter', adapter, true);
  }

  play(adapter) {
    this.transport.send('play-adapter', adapter, true);
  }

  ignore(adapter) {
    this.transport.send('ignore-adapter', adapter, true);
  }

  triggerChainChange() {
    this.transport.send('chain-changed', this.chain.chain, true);
  }

  init() {
    this.transport.on('add-adapter', adapter => { // TODO move to constants
      this.isPlayed = true;

      if (this.chain.length && this.chain.last.id === adapter.id) {
        return;
      }

      if (this.chain.length) {
        this.pause(this.chain.last);
      }

      this.play(adapter);
      this.chain.push(adapter);
      this.triggerChainChange();
    });

    this.transport.on('update-adapter', adapter => {
      this.chain.update(adapter);
      this.triggerChainChange();
    });

    this.transport.on('disable-adapter', adapter => {
      if (this.chain.last.id === adapter.id) {
        this.chain.remove(adapter);
        if (this.chain.length) {
          this.play(this.chain.last);
        }
      } else {
        this.chain.remove(adapter);
      }
      this.triggerChainChange();

      this.ignore(adapter);
    });

    this.transport.on('remove-adapter', adapter => { // TODO move to constants
      if (this.chain.last.id === adapter.id) {
        this.chain.remove(adapter);
        if (this.chain.length && this.isPlayed) {
          this.play(this.chain.last);
        }
      } else {
        this.chain.remove(adapter);
      }
      this.triggerChainChange();
    });

    this.transport.on('pause-chain', () => {
      this.isPlayed = false;

      if (this.chain.length) {
        this.pause(this.chain.last);
      }
    });

    this.transport.on('play-chain', () => {
      this.isPlayed = true;

      if (this.chain.length) {
        this.play(this.chain.last);
      }
    });

    this.transport.on('get-chain', (data, cb) => {
      cb({
        chain: this.chain.chain,
        isPlayed: this.isPlayed
      });
    });
  }
}

export let chain = new AdapterChain();