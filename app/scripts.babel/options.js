'use strict';

import {DEFAULT_SETTINGS} from './lib/helper/default-settings';
import {I18n} from './lib/helper/i18n';

function saveOptions() {
  var skin = document.getElementById('skin').value;

  chrome.storage.sync.set({
    skin: skin
  }, () => {
    const status = document.getElementById('messages');

    status.textContent = chrome.i18n.getMessage('options_saved');

    setTimeout(() => {
      status.textContent = '';
    }, 850);
  });
}

function restoreOptions() {
  chrome.storage.sync.get(DEFAULT_SETTINGS, (opts) => {
    document.getElementById('skin').value = opts.skin;
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', () => {
  saveOptions();
  restoreOptions();
});

I18n.render();
