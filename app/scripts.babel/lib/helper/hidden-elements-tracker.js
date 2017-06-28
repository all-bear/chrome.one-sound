import {ScriptInjection} from '../../../bower_components/chrome-lib-script-injection/dist/js/script-injection';

export class HiddenElementsTracker {
  static init(tag) {
    ScriptInjection.inject(
      `
        (function(tag) {
          var oldCreateElement = document.createElement;
          document.createElement = function () {
            var element = oldCreateElement.apply(document, arguments);

            if (arguments[0] === tag) {
              if (!window.oneSoundHiddenElements) {
                window.oneSoundHiddenElements = {};
              }

              if (!window.oneSoundHiddenElements[tag]) {
                window.oneSoundHiddenElements[tag] = [];
              }

              window.oneSoundHiddenElements[tag].push(element);
            }

            return element;
          };
        })('${tag}');
      `
    , true);
  }

  static append(tag) {
    ScriptInjection.inject(
      `
        (function (tag) {
          if (!window.oneSoundHiddenElements) {
            return;
          }

          if (!window.oneSoundHiddenElements[tag]) {
            return;
          }

          var container = document.createElement('div');
          container.style.display = 'none';
          container.className += 'one-sound-extension-hidden-container';
          document.body.appendChild(container);

          window.oneSoundHiddenElements[tag].forEach(function (element) {
            container.appendChild(element);
          });
        })('${tag}');
      `
    , true);
  }
}