(function() {
  // todo: hide the palette history if local storage is not available
  // populate history right away
  loadHistory();

  // Bind history updates to the ratio submit button
  const actionButton = document.getElementById('brand-color-button');
  actionButton.addEventListener('click', () => {
    // add contents of the text entry to local storage
    const userInput = document.getElementById('brand-color-field').value.trim();

    // prevent empty item
    if (userInput === '') {
      return;
    }

    // Retrieve local storage or default to empty array
    let storage = JSON.parse(localStorage.getItem('palettes'));
    if (storage) {
      // Prevent duplicate items in history/storage
      if (storage.indexOf(userInput) !== -1) {
        return;
      }
      storage.push(userInput);
    }
    else {
      storage = [userInput];
    }

    localStorage.setItem('palettes', JSON.stringify(storage));

    loadHistory();
  });

  /**
   * Event listener to clear local storage.
   */
  document.getElementById('js-clear-history').addEventListener('click', () => {
    clearHistory();
  });

  /**
   * Used for initial population from localStorage.
   */
  function loadHistory() {
    const storedPalettes = JSON.parse(localStorage.getItem('palettes'));
    // clear out any existing palettes (to support delete and update)
    historyMarkupDelete();
    // We will toggle default placeholder text based on stored palettes
    const emptyText = document.querySelector("#js-input-history .empty-text");

    if (storedPalettes && storedPalettes.length > 0) {
      emptyText.style.display = "none";
      storedPalettes.map(palette => {
        let values = extractValues(palette);
        let markup = createPaletteFromValues(values);
        updateHistory(markup);
      });
    }
    else {
      emptyText.style.display = "block";
    }
  }

  /**
   * Update the input history content.
   *
   * @param {String} markup
   */
  function updateHistory(markup) {
    const historySection = document.getElementById('js-input-history');
    historySection.appendChild(markup);
  }

  /**
   * Create markup for a single palette.
   *
   * @param {array} items
   */
  function createPaletteFromValues(items) {
    if (Array.isArray(items) === false) {
      return;
    }

    // create wrapper for this set
    let element = document.createElement('div');
    element.className = 'js-palette__history palette__swatches form__group';

    // add button to populate textarea
    const popButton = document.createElement('button');
    popButton.value = items;
    popButton.className = 'btn';
    popButton.innerHTML = 'Ratios';

    popButton.addEventListener('click', (e) => {
      // when clicked, push selected history item into the app's palette form and submit it.
      const target = document.getElementById('brand-color-field');
      target.value = onePerLine(e.target.value);
      const submit = document.getElementById('brand-color-button');
      // submitting the form will generate the ratios and activate the ratio results tab
      submit.click();
    });
    element.appendChild(popButton);

    // create each color swatch and add to the set
    // todo: replace this for with a different loop structure
    for (let i=0;i<items.length;i++) {
      let swatch = document.createElement('span');
      swatch.className = 'swatch';
      swatch.style.backgroundColor = items[i];
      swatch.title = items[i];
      element.appendChild(swatch);
    }

    // Trash button for single element
    const trashButton = document.createElement('button');
    trashButton.className = 'btn btn--transparent palette__delete';
    trashButton.title = 'Delete this palette';
    trashButton.dataset.swatch = items;
    trashButton.innerHTML = '<svg class="palette__trash-icon"><use xlink:href="#trash" /></svg>';
    trashButton.addEventListener('click', (e) => {
      deletePalette(items);
    });

    element.appendChild(trashButton);

    return element;
  }

  /**
   * Deletes stored palettes and refreshes interface.
   */
  function clearHistory () {
    localStorage.removeItem('palettes');
    // remove the palettes from the page
    historyMarkupDelete();
    loadHistory();
  }

  /**
   * Removes palette set elements from DOM.
   */
  function historyMarkupDelete() {
    let palettes = document.getElementsByClassName('js-palette__history');
    while (palettes[0]) {
      palettes[0].parentNode.removeChild(palettes[0]);
    }
  }
  /**
   * Delete a single item from the palette history
   *
   * @param {Array} paletteArray The palette to delete from local storage.
   *
   */
  function deletePalette(paletteArray) {
    // stored values are \n separated strings so we change to that format
    const paletteString = onePerLine(paletteArray.toString());

    // Load storage and filter it to remove the palette
    const storage = JSON.parse(localStorage.getItem('palettes'));
    const updatedStorage = storage.filter((value, index, arr) => value != paletteString);

    // update local storage with remaining values and reload the interface
    localStorage.setItem('palettes', JSON.stringify(updatedStorage));
    loadHistory();
  }

  /**
   * Take comma separated color values and make one per line.
   *
   * @param {String} list
   * A comma separated string containing rgb or hex color values.
   *
   * @return {String}
   */
  function onePerLine(list) {
    // First split hex values
    let string = list.replace(/(,#)/g, '\n#');
    // next split off rgb values
    string = string.replace(/(,r)/g, "\nr");

    return string;
  }

  /**
   * Extract separate color values from input.
   *
   * Safely removes empty lines within the input
   *
   * @param {String} stringInput
   *
   * @return {Array}
   */
  function extractValues(stringInput) {
    return stringInput
      .split('\n')
      .filter(value => value !== '')
  }

  /**
   * Check if local storage is supported by client browser
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
   */
  function storageAvailable(type) {
    var storage;
    try {
      storage = window[type];
      var x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    }
    catch(e) {
      return e instanceof DOMException && (
          // everything except Firefox
        e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        // everything except Firefox
        e.name === 'QuotaExceededError' ||
        // Firefox
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        (storage && storage.length !== 0);
    }
  }
})();
