(function () {
  var storageKey = 'personal-archive-custom-data';
  var defaultData = JSON.parse(JSON.stringify(window.archiveData || {}));

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function emptyStore() {
    return {
      work: [],
      inspirations: []
    };
  }

  function normalizeStore(data) {
    return {
      work: Array.isArray(data && data.work) ? data.work : [],
      inspirations: Array.isArray(data && data.inspirations) ? data.inspirations : []
    };
  }

  function storageAvailable() {
    try {
      var probe = '__archive_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      return true;
    } catch (error) {
      return false;
    }
  }

  function loadCustomData() {
    if (!storageAvailable()) {
      return emptyStore();
    }

    try {
      var raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        return emptyStore();
      }

      return normalizeStore(JSON.parse(raw));
    } catch (error) {
      return emptyStore();
    }
  }

  function saveCustomData(data) {
    if (!storageAvailable()) {
      return false;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(normalizeStore(data)));
    return true;
  }

  window.archiveManager = {
    storageAvailable: storageAvailable,
    getItems: function (section) {
      var baseItems = Array.isArray(defaultData[section]) ? clone(defaultData[section]) : [];
      var customItems = loadCustomData()[section] || [];
      return baseItems.concat(clone(customItems));
    },
    getCustomItems: function (section) {
      return clone(loadCustomData()[section] || []);
    },
    addItem: function (section, item) {
      var data = loadCustomData();
      data[section].push(clone(item));
      return saveCustomData(data);
    },
    removeItem: function (section, itemId) {
      var data = loadCustomData();
      data[section] = (data[section] || []).filter(function (item) {
        return item.id !== itemId;
      });
      return saveCustomData(data);
    },
    clearItems: function (section) {
      var data = loadCustomData();
      data[section] = [];
      return saveCustomData(data);
    }
  };
})();
