// gridstack-init.js

// Voraussetzung: GridStack CSS & JS sind in index.html bereits eingebunden!
// Beispiel (falls noch nicht):
// <link href="https://cdn.jsdelivr.net/npm/gridstack@8.2.2/dist/gridstack.min.css" rel="stylesheet" />
// <script src="https://cdn.jsdelivr.net/npm/gridstack@8.2.2/dist/gridstack.all.js"></script>

let grid;
const userTilesKey = 'smartbio-gridstack-tiles';

window.addEventListener('load', () => {
  const tilesContainer = document.getElementById('tilesContainer');
  if (!tilesContainer) {
    console.error('tilesContainer nicht gefunden!');
    return;
  }

  grid = GridStack.init({
    float: true, // freie Positionierung (oben/unten/neben)
    column: 12,
    resizable: {
      handles: 'e, se, s, sw, w'
    },
    disableOneColumnMode: true,
    animate: true,
  }, '#tilesContainer');

  // Alte Tiles vom Backend oder localStorage laden
  loadSavedTilesForGrid();

  // Event: wenn Tiles verschoben oder Größe geändert wird
  grid.on('change', (event, items) => {
    saveGridData(items);
  });

  // Beispiel: Öffnet Popup für neue Kachel (kannst du anpassen)
  window.addTile = function(type = 'full') {
    openTilePopup(type);
  };

  // Popup-Speicher-Button Listener
  const saveBtn = document.getElementById('saveTileBtn');
  const cancelBtn = document.getElementById('cancelTileBtn');

  if (saveBtn) saveBtn.addEventListener('click', addTileToGridFromPopup);
  if (cancelBtn) cancelBtn.addEventListener('click', closeTilePopup);
});

// Lade gespeicherte Tiles aus localStorage oder Firestore (hier demo localStorage)
function loadSavedTilesForGrid() {
  const dataStr = localStorage.getItem(userTilesKey);
  let tiles = [];

  if (dataStr) {
    try {
      tiles = JSON.parse(dataStr);
    } catch (e) {
      console.error('Fehler beim Parsen der gespeicherten Tiles:', e);
    }
  }

  if (tiles.length === 0) {
    // Default Beispieltile
    tiles = [
      {id: 't1', x: 0, y: 0, w: 6, h: 2, content: 'Beispiel 1', type: 'half'},
      {id: 't2', x: 6, y: 0, w: 6, h: 2, content: 'Beispiel 2', type: 'half'},
    ];
  }

  grid.removeAll();

  tiles.forEach(tile => {
    const el = document.createElement('div');
    el.classList.add('grid-stack-item');
    el.setAttribute('gs-x', tile.x);
    el.setAttribute('gs-y', tile.y);
    el.setAttribute('gs-w', tile.w);
    el.setAttribute('gs-h', tile.h);
    el.setAttribute('id', tile.id);

    const content = document.createElement('div');
    content.classList.add('grid-stack-item-content');
    content.innerHTML = tile.content || 'Neue Kachel';

    el.appendChild(content);
    grid.addWidget(el);
  });
}

// Speichert Tiles in localStorage (du kannst das auf Firestore anpassen)
function saveGridData(items) {
  if (!items || items.length === 0) return;

  const tiles = items.map(i => ({
    id: i.el.id || `tile-${Date.now()}`,
    x: i.x,
    y: i.y,
    w: i.w,
    h: i.h,
    content: i.el.querySelector('.grid-stack-item-content')?.innerHTML || ''
  }));

  localStorage.setItem(userTilesKey, JSON.stringify(tiles));
  console.log('Tiles gespeichert:', tiles);
}

// Fügt neue Kachel aus Popup zum Gridstack hinzu
function addTileToGridFromPopup() {
  const popup = document.getElementById('tilePopup');
  if (!popup) return;

  const type = popup.dataset.type || 'full';
  const link = document.getElementById('tileLinkInput').value.trim();
  const text = document.getElementById('tileTextInput').value.trim();
  const image = document.getElementById('tileImageInput').value.trim();

  if (!link && !text && !image) {
    alert('Bitte mindestens einen Link, Text oder Bild-URL eingeben!');
    return;
  }

  // Erstelle Content div
  let contentHtml = '';

  if (link) {
    contentHtml += `<a href="${link}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration:none;">`;
    if (text) contentHtml += `<div>${text}</div>`;
    if (image) contentHtml += `<img src="${image}" alt="${text || 'Kachel Bild'}" style="max-width:100%; border-radius: 8px; margin-top: 0.5rem;">`;
    contentHtml += '</a>';
  } else {
    if (text) contentHtml += `<div>${text}</div>`;
    if (image) contentHtml += `<img src="${image}" alt="${text || 'Kachel Bild'}" style="max-width:100%; border-radius: 8px; margin-top: 0.5rem;">`;
  }

  // Definiere Größe je nach type
  let w = 12, h = 3;
  if (type === 'half') { w = 6; h = 3; }
  else if (type === 'square') { w = 6; h = 6; }

  // Neues Element
  const el = document.createElement('div');
  el.classList.add('grid-stack-item');
  el.setAttribute('gs-w', w);
  el.setAttribute('gs-h', h);
  el.setAttribute('id', `tile-${Date.now()}`);

  const content = document.createElement('div');
  content.classList.add('grid-stack-item-content');
  content.innerHTML = contentHtml;

  el.appendChild(content);
  grid.addWidget(el);

  closeTilePopup();

  // Nach dem hinzufügen speichern
  saveGridData(grid.save());
}

// Popup schließen
function closeTilePopup() {
  const popup = document.getElementById('tilePopup');
  if (!popup) return;
  popup.style.display = 'none';

  document.getElementById('tileLinkInput').value = '';
  document.getElementById('tileTextInput').value = '';
  document.getElementById('tileImageInput').value = '';
}
