document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startHighlight').addEventListener('click', () => {
    console.log('startHighlight clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          if (typeof startSelection === 'function') {
            startSelection();
          }
        }
      });
    });
  });

  document.getElementById('exitHighlight').addEventListener('click', () => {
    console.log('exitHighlight clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          if (typeof cleanup === 'function') {
            cleanup();
          }
        }
      });
    });
  });

  document.getElementById('updateList').addEventListener('click', () => {
    console.log('updateList clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const selectedElements = window.selectedElements;
          const url = window.location.href;
          return { selectedElements, url };
        }
      }, (results) => {
        if (results && results[0] && results[0].result) {
          const { selectedElements, url } = results[0].result;
          console.log('Selectors received:', selectedElements);
          updateElementList(selectedElements, url);

          // Set the window.category and window.label values
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (url, selectedElements) => {
              window.category = url;
              window.label = selectedElements.map(selector => selector);
            },
            args: [url, selectedElements]
          });
        } else {
          console.log('No selected elements found.');
        }
      });
    });
  });

  document.getElementById('removeAllHighlights').addEventListener('click', () => {
    console.log('removeAllHighlights clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          if (typeof cleanup === 'function') {
            cleanup();
          }
        }
      });
    });
  });

  // Add event listener for the Download Script button
  document.getElementById('downloadScript').addEventListener('click', () => {
    console.log('downloadScript clicked');
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          if (typeof finalizeSelection === 'function') {
            finalizeSelection();
          }
        }
      });
    });
  });

  // Add event listener for the question mark image
  document.getElementById('help-icon').addEventListener('click', () => {
    const instructions = document.getElementById('instructions');
    if (instructions.style.display === 'none' || instructions.style.display === '') {
      instructions.style.display = 'block';
    } else {
      instructions.style.display = 'none';
    }
  });
});

function updateElementList(selectors, url) {
  console.log('updateElementList called with selectors:', selectors);
  const elementList = document.getElementById('elementList');
  elementList.innerHTML = ''; // Clear existing list

  selectors.forEach((selector, index) => {
    const div = document.createElement('div');
    div.className = 'element-item';

    div.innerHTML = `
      <span class="element-number">${index + 1}.</span>
      <div class="input-container">
        <label for="category-${index}" class="input-label">Category</label>
        <input id="category-${index}" type="text" value="${url}" placeholder="Category" class="element-category" />
        <label for="label-${index}" class="input-label">Label</label>
        <input id="label-${index}" type="text" value="${selector}" placeholder="Label" class="element-label" />
      </div>
    `;
    elementList.appendChild(div);
  });
}

