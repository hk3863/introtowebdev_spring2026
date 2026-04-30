document.addEventListener('DOMContentLoaded', function () {
  var archiveManager = window.archiveManager || null;

  if (!archiveManager) {
    return;
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function capitalizeFirst(value) {
    var trimmed = value.trim();

    if (!trimmed) {
      return '';
    }

    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  function toneSet(name) {
    var tones = {
      sand: { top: '#d7c7b0', bottom: '#97856d', accent: '#f5ecde' },
      olive: { top: '#9faa8c', bottom: '#626c52', accent: '#dde4d1' },
      slate: { top: '#9ea7b3', bottom: '#5e6674', accent: '#e0e6ef' },
      rose: { top: '#c7b1c8', bottom: '#806984', accent: '#eadff0' },
      charcoal: { top: '#85888d', bottom: '#3f4246', accent: '#d4d7db' }
    };

    return tones[name] || tones.sand;
  }

  function setStatus(node, message, isError) {
    if (!node) {
      return;
    }

    node.textContent = message;
    node.classList.toggle('is-error', !!isError);
  }

  function renderLog(section, targetId, formatter) {
    var list = document.getElementById(targetId);

    if (!list) {
      return;
    }

    var items = archiveManager.getCustomItems(section);
    list.innerHTML = '';

    if (!items.length) {
      var emptyItem = document.createElement('li');
      emptyItem.className = 'editor-log-empty';
      emptyItem.textContent = 'No saved entries yet.';
      list.appendChild(emptyItem);
      return;
    }

    items.forEach(function (item) {
      var row = document.createElement('li');
      row.className = 'editor-log-item';
      row.innerHTML =
        '<div class="editor-log-item-copy">' +
        formatter(item) +
        '</div>';

      var deleteButton = document.createElement('button');
      deleteButton.className = 'editor-log-delete';
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', function () {
        var status =
          section === 'work'
            ? document.getElementById('work-editor-status')
            : document.getElementById('inspiration-editor-status');

        if (!window.confirm('Delete this saved entry from the browser archive?')) {
          return;
        }

        archiveManager.removeItem(section, item.id);
        setStatus(status, 'Saved entry deleted.', false);
        refreshLogs();
      });

      list.appendChild(row);
      row.appendChild(deleteButton);
    });
  }

  function refreshLogs() {
    renderLog('work', 'work-editor-log', function (item) {
      return (
        '<strong>' +
        item.title +
        '</strong><span>' +
        item.details +
        '</span>'
      );
    });

    renderLog('inspirations', 'inspiration-editor-log', function (item) {
      return (
        '<strong>' +
        item.title +
        '</strong><span>' +
        item.type.charAt(0).toUpperCase() +
        item.type.slice(1) +
        '</span>'
      );
    });
  }

  var workForm = document.getElementById('work-editor-form');
  var workStatus = document.getElementById('work-editor-status');
  var workReset = document.getElementById('work-editor-reset');

  if (workForm) {
    workForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!archiveManager.storageAvailable()) {
        setStatus(workStatus, 'Local storage is unavailable in this browser.', true);
        return;
      }

      var formData = new FormData(workForm);
      var title = capitalizeFirst(formData.get('title'));
      var category = formData.get('category');
      var details = formData.get('details').trim();
      var summary = formData.get('summary').trim();
      var tones = toneSet(formData.get('tone'));
      var count = archiveManager.getItems('work').length + 1;

      archiveManager.addItem('work', {
        id: slugify(title) + '-' + Date.now(),
        label: 'Project ' + String(count).padStart(2, '0'),
        title: title,
        summary: summary,
        details: details,
        category: category,
        pills: [category],
        placeholder: false,
        toneTop: tones.top,
        toneBottom: tones.bottom,
        toneAccent: tones.accent
      });

      workForm.reset();
      setStatus(workStatus, 'Saved to this browser.', false);
      refreshLogs();
    });
  }

  if (workReset) {
    workReset.addEventListener('click', function () {
      if (!archiveManager.storageAvailable()) {
        setStatus(workStatus, 'Local storage is unavailable in this browser.', true);
        return;
      }

      if (!window.confirm('Clear saved work entries from this browser?')) {
        return;
      }

      archiveManager.clearItems('work');
      setStatus(workStatus, 'Saved work entries cleared.', false);
      refreshLogs();
    });
  }

  var inspirationForm = document.getElementById('inspiration-editor-form');
  var inspirationStatus = document.getElementById('inspiration-editor-status');
  var inspirationReset = document.getElementById('inspiration-editor-reset');
  var inspirationGeneratedPath = document.getElementById('inspiration-generated-path');

  function buildInspirationImagePath() {
    if (!inspirationForm || !inspirationGeneratedPath) {
      return '';
    }

    var titleField = inspirationForm.elements.title;
    var typeField = inspirationForm.elements.type;
    var extensionField = inspirationForm.elements.extension;
    var title = titleField ? titleField.value.trim() : '';
    var type = typeField ? typeField.value : 'book';
    var extension = extensionField ? extensionField.value : 'jpg';
    var slug = title ? slugify(title) : 'new-inspiration';
    var path = './img/inspirations/' + type + '/' + slug + '.' + extension;

    inspirationGeneratedPath.textContent = path;
    return path;
  }

  if (inspirationForm) {
    Array.from(inspirationForm.querySelectorAll('input, select')).forEach(function (field) {
      field.addEventListener('input', buildInspirationImagePath);
      field.addEventListener('change', buildInspirationImagePath);
    });

    buildInspirationImagePath();

    inspirationForm.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!archiveManager.storageAvailable()) {
        setStatus(inspirationStatus, 'Local storage is unavailable in this browser.', true);
        return;
      }

      var formData = new FormData(inspirationForm);
      var title = capitalizeFirst(formData.get('title'));

      archiveManager.addItem('inspirations', {
        id: slugify(title) + '-' + Date.now(),
        title: title,
        type: formData.get('type'),
        image: buildInspirationImagePath(),
        imageAlt: formData.get('imageAlt').trim()
      });

      inspirationForm.reset();
      buildInspirationImagePath();
      setStatus(inspirationStatus, 'Saved to this browser.', false);
      refreshLogs();
    });
  }

  if (inspirationReset) {
    inspirationReset.addEventListener('click', function () {
      if (!archiveManager.storageAvailable()) {
        setStatus(inspirationStatus, 'Local storage is unavailable in this browser.', true);
        return;
      }

      if (!window.confirm('Clear saved inspiration entries from this browser?')) {
        return;
      }

      archiveManager.clearItems('inspirations');
      setStatus(inspirationStatus, 'Saved inspiration entries cleared.', false);
      refreshLogs();
    });
  }

  refreshLogs();
});
