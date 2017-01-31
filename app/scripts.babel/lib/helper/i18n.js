/* global chrom */

export class I18n {
  static render() {
    debugger;
    var els = document.querySelectorAll('[data-translate="true"]');

    Array.prototype.forEach.call(els, el => {
      var code = el.innerHTML,
        msg = chrome.i18n.getMessage(code);

      if (msg) {
        el.innerHTML = chrome.i18n.getMessage(code);
      }
    });
  }
}