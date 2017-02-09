/* global chrome */

class Transport {
  send(code, data, isBackground, cb) {
    if (isBackground) {
      this.sendToContent(code, data, cb);
    } else {
      this.sendToBackground(code, data, cb);
    }
  }

  sendToBackground(code, data, cb) {
    chrome.runtime.sendMessage({code, data}, cb);
  }

  sendToContent(code, data, cb) {
    chrome.tabs.query({}, function (tabs) {
       tabs.forEach(function (tab) {
         chrome.tabs.sendMessage(tab.id, {code, data}, cb);
       });
    });
  }

  on(code, cb) {
    chrome.runtime.onMessage.addListener(function (request, sender, senderCb) {
      if (request.code === code) {
        cb(request.data, senderCb);
      }
    });
  }
}

export let transport = new Transport();