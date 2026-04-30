document.addEventListener('DOMContentLoaded', function () {
  var archiveData = window.archiveData || {};
  var archiveManager = window.archiveManager || null;

  function getArchiveItems(section) {
    if (archiveManager && typeof archiveManager.getItems === 'function') {
      return archiveManager.getItems(section);
    }

    return Array.isArray(archiveData[section]) ? archiveData[section].slice() : [];
  }

  function titleCase(value) {
    return value
      .split('-')
      .map(function (part) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(' ');
  }

  function slugify(value) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function renderFilterButtons(container, filters, activeFilter, onSelect) {
    container.innerHTML = '';

    filters.forEach(function (filter) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'filter-chip' + (filter.value === activeFilter ? ' is-active' : '');
      button.textContent = filter.label;
      button.setAttribute('aria-pressed', filter.value === activeFilter ? 'true' : 'false');
      button.addEventListener('click', function () {
        onSelect(filter.value);
      });
      container.appendChild(button);
    });
  }

  function pluralize(count, singular, plural) {
    return count === 1 ? singular : plural;
  }

  function toneSet(name) {
    var tones = {
      sand: {
        top: '#d7c7b0',
        bottom: '#97856d',
        accent: '#f5ecde'
      },
      olive: {
        top: '#9faa8c',
        bottom: '#626c52',
        accent: '#dde4d1'
      },
      slate: {
        top: '#9ea7b3',
        bottom: '#5e6674',
        accent: '#e0e6ef'
      },
      rose: {
        top: '#c7b1c8',
        bottom: '#806984',
        accent: '#eadff0'
      },
      charcoal: {
        top: '#85888d',
        bottom: '#3f4246',
        accent: '#d4d7db'
      }
    };

    return tones[name] || tones.sand;
  }

  function createWorkCard(item, order, sourceIndex) {
    var article = document.createElement('article');
    article.className = 'work-card';
    article.tabIndex = 0;
    article.style.setProperty('--card-order', order);
    article.dataset.sourceIndex = sourceIndex;
    article.dataset.id = item.id;
    article.style.setProperty('--tone-top', item.toneTop || '#d8d2c7');
    article.style.setProperty('--tone-bottom', item.toneBottom || '#7d7468');
    article.style.setProperty('--tone-accent', item.toneAccent || '#f3efe8');
    article.dataset.label = item.label;
    article.dataset.title = item.title;
    article.dataset.details = item.details;
    article.dataset.summary = item.summary;
    article.style.setProperty('--card-height', '0px');
    article.style.setProperty('--rest-offset', '0px');
    article.style.setProperty('--card-tilt', '0deg');

    var file = document.createElement('div');
    file.className = 'work-card-file';

    var band = document.createElement('div');
    band.className = 'work-book-band';

    var lines = document.createElement('div');
    lines.className = 'work-book-lines';

    for (var index = 0; index < 2; index += 1) {
      var line = document.createElement('span');
      line.className = 'work-book-line';
      lines.appendChild(line);
    }

    file.appendChild(band);
    file.appendChild(lines);
    article.appendChild(file);

    return article;
  }

  function createInspirationCard(item) {
    var article = document.createElement('article');
    article.className = 'gallery-item gallery-item-' + item.type;
    article.dataset.filter = item.type;
    article.dataset.id = item.id;

    var imageWrap = document.createElement('div');
    imageWrap.className = 'gallery-image';

    var image = document.createElement('img');
    image.src = item.image;
    image.alt = item.imageAlt;

    var caption = document.createElement('div');
    caption.className = 'gallery-caption gallery-overlay';

    var type = document.createElement('p');
    type.className = 'archive-type';
    type.textContent = titleCase(item.type);

    var heading = document.createElement('h3');
    heading.textContent = item.title;

    imageWrap.appendChild(image);
    caption.appendChild(type);
    caption.appendChild(heading);
    article.appendChild(imageWrap);
    article.appendChild(caption);

    return article;
  }

  function initWorkFilters() {
    var grid = document.getElementById('work-grid');
    var controls = document.getElementById('work-filter-controls');
    var summary = document.getElementById('work-filter-summary');
    var empty = document.getElementById('work-empty');
    var previewLabel = document.getElementById('work-preview-label');
    var previewTitle = document.getElementById('work-preview-title');
    var previewDetails = document.getElementById('work-preview-details');
    var previewSummary = document.getElementById('work-preview-summary');

    if (
      !grid ||
      !controls ||
      !summary ||
      !empty ||
      !previewLabel ||
      !previewTitle ||
      !previewDetails ||
      !previewSummary
    ) {
      return null;
    }

    var activeFilter = 'all';
    var lastVisibleItems = [];
    var currentItems = [];
    var highlightedId = null;

    function updateShelfLayout() {
      if (!lastVisibleItems.length) {
        return;
      }

      var isMobile = window.innerWidth <= 767;
      var gridWidth = grid.clientWidth || (isMobile ? 320 : 960);
      var gridHeight = grid.clientHeight || (isMobile ? 320 : 520);
      var cards = Array.from(grid.querySelectorAll('.work-card'));
      var widthFactors = [0.68, 0.92, 0.78, 1.12, 0.84, 0.72, 1.04, 0.88, 1.18, 0.74, 0.96, 0.8];
      var allFactors = currentItems.map(function (_, index) {
        return widthFactors[index % widthFactors.length];
      });
      var factorTotal = allFactors.reduce(function (sum, factor) {
        return sum + factor;
      }, 0);
      var unitWidth = gridWidth / factorTotal;
      var verticalSpan = 0;
      var baseBottom = isMobile ? 46 : 68;
      var baseHeight = Math.round(gridHeight * (isMobile ? 0.66 : 0.72));
      var heightWave = [-24, 10, -12, 16, -6, 10, -18, 6, -4, 12, -10, 18];
      var visibleWidths = cards.map(function (card, index) {
        var sourceIndex = Number(card.dataset.sourceIndex || index);
        return Math.round(unitWidth * allFactors[sourceIndex]);
      });
      var totalVisibleWidth = visibleWidths.reduce(function (sum, width) {
        return sum + width;
      }, 0);
      var left = activeFilter === 'all' ? 0 : Math.max(0, Math.round((gridWidth - totalVisibleWidth) / 2));

      cards.forEach(function (card, index) {
        var bottom = baseBottom + verticalSpan;
        var sourceIndex = Number(card.dataset.sourceIndex || index);
        var height = baseHeight + heightWave[sourceIndex % heightWave.length];
        var width = visibleWidths[index];

        card.style.left = left + 'px';
        card.style.bottom = bottom + 'px';
        card.style.width = width + 'px';
        card.style.setProperty('--card-height', height + 'px');
        card.style.setProperty('--rest-offset', '0px');
        card.style.setProperty('--card-tilt', '0deg');
        left += width;
      });
    }

    function setPreview(item) {
      previewLabel.textContent = item.label;
      previewTitle.textContent = item.title;
      previewDetails.textContent = item.details;
      previewSummary.textContent = item.summary;
    }

    function render() {
      currentItems = getArchiveItems('work');

    var categoryOrder = [
      'marketing',
      'interactive-media',
      'coding',
      'data-analysis',
      'strategy'
    ];
    var uniqueFilters = categoryOrder.filter(function (category) {
      return currentItems.some(function (item) {
        return item.category === category;
      });
    });

    var filters = [{ label: 'All', value: 'all' }].concat(
      uniqueFilters.map(function (filterValue) {
        return {
          label: titleCase(filterValue),
          value: filterValue
        };
      })
    );

      if (
        activeFilter !== 'all' &&
        uniqueFilters.indexOf(activeFilter) === -1
      ) {
        activeFilter = 'all';
      }

      var visibleItems =
        activeFilter === 'all'
          ? currentItems
          : currentItems.filter(function (item) {
              return item.category === activeFilter;
            });

      lastVisibleItems = visibleItems;
      grid.innerHTML = '';
      grid.style.setProperty('--visible-count', visibleItems.length);

      visibleItems.forEach(function (item, index) {
        grid.appendChild(createWorkCard(item, index, currentItems.indexOf(item)));
      });

      updateShelfLayout();

      empty.hidden = visibleItems.length !== 0;

      if (visibleItems.length > 0) {
        var previewItem = visibleItems[0];

        if (highlightedId) {
          var matched = visibleItems.find(function (item) {
            return item.id === highlightedId;
          });

          if (matched) {
            previewItem = matched;
          }
        }

        setPreview(previewItem);
      } else {
        previewLabel.textContent = 'Project archive';
        previewTitle.textContent = 'No files in this category';
        previewDetails.textContent = 'Try another filter.';
        previewSummary.textContent = 'This category is empty right now.';
      }

      Array.from(grid.querySelectorAll('.work-card')).forEach(function (card, index) {
        var cardItem = visibleItems[index];

        function activatePreview() {
          highlightedId = cardItem.id;
          setPreview(cardItem);
        }

        card.addEventListener('mouseenter', activatePreview);
        card.addEventListener('focus', activatePreview);
      });

      var filterLabel = activeFilter === 'all' ? 'all project types' : titleCase(activeFilter);
      summary.textContent =
        'Showing ' +
        visibleItems.length +
        ' ' +
        pluralize(visibleItems.length, 'project', 'projects') +
        ' in ' +
        filterLabel +
        '.';

      renderFilterButtons(controls, filters, activeFilter, function (nextFilter) {
        activeFilter = nextFilter;
        highlightedId = null;
        render();
      });
    }

    window.addEventListener('resize', updateShelfLayout);
    render();

    return {
      showItem: function (itemId, filterValue) {
        highlightedId = itemId || null;
        activeFilter = filterValue || 'all';
        render();
      },
      render: render
    };
  }

  function initInspirationFilters() {
    var grid = document.getElementById('inspiration-grid');
    var controls = document.getElementById('inspiration-filter-controls');
    var summary = document.getElementById('inspiration-filter-summary');
    var empty = document.getElementById('inspiration-empty');

    if (!grid || !controls || !summary || !empty) {
      return null;
    }

    var activeFilter = 'all';
    var highlightedId = null;

    function render() {
      var currentItems = getArchiveItems('inspirations');
      var uniqueTypes = Array.from(
        new Set(
          currentItems.map(function (item) {
            return item.type;
          })
        )
      );

      var filters = [{ label: 'All', value: 'all' }].concat(
        uniqueTypes.map(function (type) {
          return {
            label: titleCase(type),
            value: type
          };
        })
      );

      if (
        activeFilter !== 'all' &&
        uniqueTypes.indexOf(activeFilter) === -1
      ) {
        activeFilter = 'all';
      }

      var visibleItems =
        activeFilter === 'all'
          ? currentItems
          : currentItems.filter(function (item) {
              return item.type === activeFilter;
            });

      grid.innerHTML = '';

      visibleItems.forEach(function (item) {
        grid.appendChild(createInspirationCard(item));
      });

      empty.hidden = visibleItems.length !== 0;
      grid.classList.toggle('is-filtered', activeFilter !== 'all' || currentItems.length > 4);

      if (highlightedId) {
        var activeCard = grid.querySelector('[data-id="' + highlightedId + '"]');
        if (activeCard) {
          activeCard.classList.add('is-highlighted');
        }
      }

      var filterLabel = activeFilter === 'all' ? 'the full archive' : titleCase(activeFilter);
      summary.textContent =
        'Showing ' +
        visibleItems.length +
        ' ' +
        pluralize(visibleItems.length, 'entry', 'entries') +
        ' from ' +
        filterLabel +
        '.';

      renderFilterButtons(controls, filters, activeFilter, function (nextFilter) {
        activeFilter = nextFilter;
        highlightedId = null;
        render();
      });
    }

    render();

    return {
      showItem: function (itemId, filterValue) {
        highlightedId = itemId || null;
        activeFilter = filterValue || 'all';
        render();
      },
      render: render
    };
  }

  initWorkFilters();
  initInspirationFilters();
});
