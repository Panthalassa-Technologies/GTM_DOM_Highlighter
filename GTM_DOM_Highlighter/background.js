chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: 'highlightElement',
      title: 'Highlight Element',
      contexts: ['all']
    });
  });
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'highlightElement') {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    }
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSelectedElements') {
      chrome.scripting.executeScript(
        {
          target: { tabId: sender.tab.id },
          func: () => {
            return window.selectedElements.map(element => {
              const tagName = element.tagName.toLowerCase();
              const classList = element.className ? `.${element.className.split(' ').join('.')}` : '';
              const id = element.id ? `#${element.id}` : '';
              return `${tagName}${id}${classList}`;
            });
          },
        },
        (results) => {
          if (results && results[0] && results[0].result) {
            sendResponse({ selectors: results[0].result });
          }
        }
      );
      return true; // Keep the message channel open for sendResponse
    }
  });
  