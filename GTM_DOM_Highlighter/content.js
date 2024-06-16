if (typeof window.selectedElements === 'undefined') {
  window.selectedElements = [];

  // Initialize selectedElements from chrome.storage.local
  chrome.storage.local.get(['selectedElements'], function(result) {
    window.selectedElements = result.selectedElements || [];
    console.log('Initialized selectedElements:', window.selectedElements);
    highlightSelectedElements();
  });

  function highlightSelectedElements() {
    window.selectedElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.outline = '2px solid red';
      });
    });
  }

  function handleElementSelection(event) {
    event.preventDefault();
    event.stopPropagation();

    const element = event.target;
    const tagName = element.tagName.toLowerCase();
    const classList = element.className ? `.${element.className.split(' ').join('.')}` : '';
    const id = element.id ? `#${element.id}` : '';
    const selector = `${tagName}${id}${classList}`;

    if (!window.selectedElements.includes(selector) && window.selectedElements.length < 10) {
      window.selectedElements.push(selector);
      element.style.outline = '2px solid red';
      console.log('Element selected:', selector);
      chrome.storage.local.set({ selectedElements: window.selectedElements });
    }
  }

  function startSelection() {
    document.addEventListener('click', handleElementSelection, true);
    document.addEventListener('keydown', handleKeyDown, true);
  }

  function cleanup() {
    window.selectedElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        element.style.outline = '';
      });
    });
    document.removeEventListener('click', handleElementSelection, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    window.selectedElements = [];
    chrome.storage.local.set({ selectedElements: [] });
    console.log('Selection cleared');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      finalizeSelection();
    }
  }

  function finalizeSelection() {
    const elementSelectors = window.selectedElements.map(selector => {
      return selector;
    });

    const firstPartOfScript =
      `<script>
        function sendEvent(config) {
          if (typeof ga !== 'undefined') {
            ga('send', 'event', {
              eventAction: config.action,
              eventCategory: config.category,
              eventLabel: config.label,
            });
          }
          if (typeof gtag !== 'undefined') {
            gtag('event', config.action, {
              event_category: config.category,
              event_label: config.label,
            });
          }
        }
      `;

    const secondPartOfScript = `</script>`;

    const domElementEventListeners = elementSelectors.map((selector, index) => {
      return `document.addEventListener(
        'click',
        function (event) {
          const eventElement = event.target.closest('${selector}');
          if (eventElement) {
            sendEvent({
              action: 'click',
              category: '${window.category}',
              label: '${window.label[index]}',
            });
          }
        },
        true
      );
      `;
    });

    const contentFormatted = firstPartOfScript + domElementEventListeners.join('\n') + secondPartOfScript;
    const contentMinified = (firstPartOfScript + domElementEventListeners.join('') + secondPartOfScript)
      .replace(/\s+/g, ' ')
      .replace(/> </g, '><')
      .trim();

    const formattedDateTime = new Date().toLocaleString().replace(/[:/]/g, '-');
    const fileNameFormatted = `GTM_Tracked_Elements_${formattedDateTime}.txt`;
    const fileNameMinified = `GTM_Tracked_Elements_${formattedDateTime}_min.txt`;

    downloadFile(fileNameFormatted, contentFormatted);
    downloadFile(fileNameMinified, contentMinified);

    // Cleanup after download
    cleanup();
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
