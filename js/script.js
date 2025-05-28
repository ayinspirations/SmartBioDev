let isLoggedIn = false; // Start: nicht eingeloggt
let isEditing = false;
let userName = null;

// Sobald die Seite geladen ist
window.onload = () => {
  // Prüfe Login-Status im localStorage
  userName = localStorage.getItem('userName');
  isLoggedIn = !!userName;

  if (!isLoggedIn) {
    // Login anzeigen, Content verstecken
    document.getElementById('loginContainer').style.display = 'block';
    document.getElementById('contentContainer').style.display = 'none';
  } else {
    // Content anzeigen, Login verstecken
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('contentContainer').style.display = 'block';
    updateUsernameInHeader();
    showEditButton();
  }

  // Registrierungs-Button Handler
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.onclick = () => {
      const inputName = document.getElementById('inputName').value.trim();
      if (!inputName) {
        alert('Bitte gib einen Namen ein!');
        return;
      }
      userName = inputName;
      localStorage.setItem('userName', userName);
      isLoggedIn = true;
      // UI umschalten
      document.getElementById('loginContainer').style.display = 'none';
      document.getElementById('contentContainer').style.display = 'block';
      updateUsernameInHeader();
      showEditButton();
    };
  }

  // Kachel-Optionen Buttons verbinden (dein Original)
  document.querySelectorAll('#kachelOptionen button').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.textContent.includes('Quadratisch') ? 'square' : (btn.textContent.includes('halbe') ? 'half' : 'full');
      addTile(type);
    });
  });

  // Theme-Dropdown Event (dein Original)
  const themeDropdown = document.getElementById('themeDropdown');
  if (themeDropdown) {
    themeDropdown.addEventListener('change', function () {
      wechselTheme(this.value);
    });
  }
};

// Helfer: Username im Header aktualisieren
function updateUsernameInHeader() {
  const headerUsername = document.getElementById('headerUsername');
  if (headerUsername && userName) {
    headerUsername.textContent = userName;
  }
}

// Bearbeiten-Button anzeigen (dein Original unverändert)
function showEditButton() {
  const header = document.querySelector('.header');
  if (header.querySelector('#editModeBtn')) return; // Button existiert schon, nicht erneut hinzufügen

  const editBtn = document.createElement('button');
  editBtn.id = 'editModeBtn'; // eindeutige ID für spätere Referenz
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

// Bearbeitungsmodus umschalten (dein Original unverändert)
function toggleEditMode() {
  isEditing = !isEditing;

  // Toggle ThemeSelector Dropdown
  const themeSelector = document.getElementById('themeSelector');
  if (themeSelector) {
    themeSelector.style.display = isEditing ? 'block' : 'none';
  }

  // Tiles editieren / entfernen aktivieren
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
      tile.contentEditable = true; // Optional: Inhalte direkt editierbar
    } else {
      const existing = tile.querySelector('.remove-btn');
      if (existing) existing.remove();
      tile.contentEditable = false;
    }
  });

  // Kachel-Optionen Buttons anzeigen/verstecken
  const kachelOptionen = document.getElementById('kachelOptionen');
  if (kachelOptionen) {
    kachelOptionen.style.display = isEditing ? 'flex' : 'none';
  }

  // Button-Text anpassen
  const editBtn = document.getElementById('editModeBtn');
  if (editBtn) {
    editBtn.textContent = isEditing ? 'Bearbeiten beenden' : 'Bearbeiten';
  }
}

// Neue Kachel hinzufügen (dein Original unverändert)
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

// Theme-Wechsel Funktion (dein Original unverändert)
function wechselTheme(name) {
  const link = document.getElementById('themeStylesheet');
  if (link) {
    link.href = `themes/theme-${name}.css`;
  }
}
