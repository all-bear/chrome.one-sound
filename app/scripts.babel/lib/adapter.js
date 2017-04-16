/* global window */

import {transport} from './transport';
import {UniqId} from '../../bower_components/uniq-id/dist/js/uniq-id';

export class Adapter {
  constructor(data) {
    this.transport = transport;

    this.type = data.type;
    this.id = UniqId.generate(data.type);
    this.behavior = data.behavior;
    this.state = this.stateObj;
    this.destroed = false;
    this.ignoredAdapters = [];
  }

  updateState(action) {
    if (action) {
      action();
    }

    this.state = this.stateObj;
  }

  toJSON() {
    return this.stateObj;
  }

  get stateObj() {
    return {
      type: this.type,
      id: this.id,
      label: this.behavior.label,
      isPlayed: this.behavior.isPlayed
    };
  }

  get isIgnored() {
    return this.ignoredAdapters.find(adapter => adapter.id === this.id);
  }

  register() {
    if (this.destroed) {
      return;
    }

    if (this.behavior.isPlayed) {
      this.transport.send('add-adapter', this);
    }

    this.behavior.registerChangeListener(() => {
      if (this.destroed || this.isIgnored) {
        return;
      }

      if (this.behavior.isPlayed != this.state.isPlayed) {
        this.transport.send(
          this.behavior.isPlayed ? 'add-adapter' : 'remove-adapter',
          this
        );
      } else {
        this.transport.send(
          'update-adapter',
          this
        )
      }

      this.updateState();
    });

    this.transport.on('play-adapter', adapter => {
      if (this.destroed || this.isIgnored) {
        return;
      }

      if (adapter.id !== this.id) {
        return;
      }


      this.updateState(this.behavior.play.bind(this.behavior));
    });

    this.transport.on('pause-adapter', adapter => {
      if (this.destroed || this.isIgnored) {
        return;
      }

      if (adapter.id !== this.id) {
        return;
      }

      this.updateState(this.behavior.pause.bind(this.behavior));
    });

    this.transport.on('ignore-adapter', adapter => {
      this.ignoredAdapters.push(adapter);
    });
  }

  destroy() {
    this.transport.send('remove-adapter', this);
    this.destroed = true;
  }
}