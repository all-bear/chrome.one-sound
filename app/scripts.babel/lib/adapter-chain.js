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

  has(adapter) {
    return this.chain.some(chainAdapter => chainAdapter.id === adapter.id);
  }

  remove(adapter) {
    this.chain = this.chain.filter(chainAdapter => chainAdapter.id !== adapter.id);
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
  }

  pause(adapter) {
    this.transport.send('pause-adapter', adapter, true, () => {});
  }

  play(adapter) {
    this.transport.send('play-adapter', adapter, true, () => {});
  }

  init() {
    this.transport.on('add-adapter', adapter => { // TODO move to constants
      if (this.chain.length && this.chain.last.id === adapter.id) {
        return;
      }

      if (this.chain.length) {
        this.pause(this.chain.last);
      }

      this.play(adapter);
      this.chain.push(adapter);
    });

    this.transport.on('remove-adapter', adapter => { // TODO move to constants
      if (this.chain.last.id === adapter.id) {
        this.chain.remove(adapter);
        this.play(this.chain.last);
      } else {
        this.chain.remove(adapter);
      }
    });

    this.transport.on('get-chain', (data, senderCb) => {
      senderCb(this.chain.chain);
    });
  }
}

export let chain = new AdapterChain();