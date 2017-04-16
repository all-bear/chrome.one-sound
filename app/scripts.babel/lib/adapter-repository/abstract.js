export class AbstractAdapterRepository {
  /**
   * Returns true if applied for all or array of RegExps
   *
   * @returns {boolean|array}
   */
  get locations() {
    return true;
  }

  loadOn(cb) {
    cb();
  }

  destroyOn(cb) {
    window.onbeforeunload = (function () {
      var oldUnload = window.onbeforeunload;

      return () => {
        if (cb) {
          cb();  
        }

        if (oldUnload) {
          oldUnload.call(window);  
        }
      };
    })();
  }
}
