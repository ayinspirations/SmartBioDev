let isLoggedIn = true; // Simuliert Login
let isEditing = false;

// Sobald die Seite geladen ist
window.onload = () => {
  if (isLoggedIn) {
    showEditButton();
  }

  // Kachel-Optionen Buttons verbinden
  document.querySelectorAll('#kachelOptionen button').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.textContent.includes('Quadratisch') ? 'square' : (btn.textContent.includes('halbe') ? 'half' : 'full');
      addTile(type);
    });
  });
};

// Bearbeiten-Button anzeigen
function showEditButton() {
  const header = document.querySelector('.header');
  const editBtn = document.createElement('button');
  editBtn.textContent = 'Bearbeiten';
  editBtn.style.marginTop = '1rem';
  editBtn.style.padding = '0.5rem 1rem';
  editBtn.style.background = '#e6735f';
  editBtn.style.color = '#fff';
  editBtn.style.border = 'none';
  editBtn.style.borderRadius = '8px';
  editBtn.style.cursor = 'pointer';
  editBtn.onclick = toggleEditMode;
  header.appendChild(editBtn);
}

// Bearbeitungsmodus umschalten
function toggleEditMode() {
  isEditing = !isEditing;
  document.querySelectorAll('.tile').forEach(tile => {
    if (tile.classList.contains('add-tile')) return;

    if (isEditing) {
      const removeBtn = document.createElement('span');
      removeBtn.textContent = '✖';
      removeBtn.style.position = 'absolute';
      removeBtn.style.top = '8px';
      removeBtn.style.right = '8px';
      removeBtn.style.color = '#e6735f';
      removeBtn.style.cursor = 'pointer';
      removeBtn.classList.add('remove-btn');
      removeBtn.onclick = () => tile.remove();
      tile.style.position = 'relative';
      tile.appendChild(removeBtn);
    } else {
      const existing = tile.querySelector('.remove-btn');
      if (existing) existing.remove();
    }
  });

  const kachelOptionen = document.getElementById('kachelOptionen');
  kachelOptionen.style.display = isEditing ? 'flex' : 'none';
}

// Neue Kachel hinzufügen
function addTile(type) {
  const tiles = document.querySelector('.tiles');
  const newTile = document.createElement('div');
  newTile.classList.add('tile');
  newTile.style.position = 'relative';

  if (type === 'half') {
    let lastRow = tiles.querySelector('.tile-row:last-child');
    if (!lastRow || lastRow.childElementCount === 2 || !lastRow.classList.contains('tile-row')) {
      lastRow = document.createElement('div');
      lastRow.classList.add('tile-row');
      tiles.insertBefore(lastRow, document.getElementById('kachelOptionen'));
    }
    newTile.innerHTML = prompt('Text für die Kachel:') || 'Neue halbe Kachel';
    lastRow.appendChild(newTile);
  } else if (type === 'square') {
    const img = document.createElement('img');
    img.src = prompt('Bild-URL für die Kachel:') || 'https://via.placeholder.com/150';
    const text = document.createElement('div');
    text.textContent = prompt('Text für die Kachel:') || 'Quadratische Kachel';

    newTile.appendChild(text);
    newTile.appendChild(img);

    const row = document.createElement('div');
    row.classList.add('tile-row');
    row.appendChild(newTile);
    tiles.insertBefore(row, document.getElementById('kachelOptionen'));
  } else {
    // full-width
    newTile.innerHTML = prompt('Text für die Kachel:') || 'Neue Kachel (volle Breite)';
    tiles.insertBefore(newTile, document.getElementById('kachelOptionen'));
  }
}

// Theme-Wechsel Funktion
function wechselTheme(name) {
  const link = document.getElementById('themeStylesheet');
  link.href = `themes/theme-${name}.css`;
}
