/* global window */

import {transport} from './transport';
import {UniqId} from './helper/uniq-id';

export class Adapter {
  constructor(data) {
    this.transport = transport;

    this.type = data.type;
    this.id = UniqId.generate(data.type);
    this.behavior = data.behavior;
    this.state = this.stateObj;
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

  register() {
    this.behavior.registerChangeListener(() => {
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
      if (adapter.id !== this.id) {
        return;
      }

      this.updateState(this.behavior.play.bind(this.behavior));
    });

    this.transport.on('pause-adapter', adapter => {
      if (adapter.id !== this.id) {
        return;
      }

      this.updateState(this.behavior.pause.bind(this.behavior));
    });
  }

  destroy() {
    this.transport.send('remove-adapter', this);
  }
}