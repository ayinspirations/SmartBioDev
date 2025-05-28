// ---------------- Firebase Config: ERSETZE DIESE Werte mit deinen Firebase Projekt-Daten ----------------
const firebaseConfig = {
  apiKey: "AIzaSyBCTa_qffHHhvauBdJQVyTlMhMmmbN3rag",
  authDomain: "smartbio-app.firebaseapp.com",
  projectId: "smartbio-app",
  storageBucket: "smartbio-app.firebasestorage.app",
  messagingSenderId: "778331841333",
  appId: "1:778331841333:web:4865dc2f0575a7b19c627c"
};

// Firebase initialisieren (compat Version)
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ------------------------------------------------------

let isEditing = false;

// Helfer, um Username im Header zu setzen
function updateUsernameInHeader(name) {
  const headerUsername = document.getElementById('headerUsername');
  if (headerUsername && name) {
    headerUsername.textContent = name;
  }
}

// Zeigt Bearbeiten Button rechts oben im Header, entfernt unteren Bearbeiten-Button (wenn vorhanden)
function showEditButton() {
  const header = document.querySelector('.header');
  if (!header) return;

  // Entferne unteren Bearbeiten-Button falls vorhanden (angenommen Klasse "bearbeiten-unten")
  const lowerBtn = document.querySelector('.btn.bearbeiten-unten');
  if (lowerBtn) lowerBtn.remove();

  if (document.getElementById('editModeBtn')) return;

  const editBtn = document.createElement('button');
  editBtn.id = 'editModeBtn';
  editBtn.textContent = 'Bearbeiten';

  // Positioniere über CSS (siehe CSS-Anpassung)
  editBtn.onclick = toggleEditMode;

  // Statt in den Header in den Body einfügen:
  document.body.appendChild(editBtn);
}

// Umschalten Bearbeitungsmodus, Buttontext und Farbe wechseln
function toggleEditMode() {
  isEditing = !isEditing;

  const themeSelector = document.getElementById('themeSelector');
  if (themeSelector) {
    themeSelector.style.display = isEditing ? 'block' : 'none';
  }

  // Username editierbar machen oder sperren
  const usernameEl = document.getElementById('headerUsername');
  if (usernameEl) {
    usernameEl.contentEditable = isEditing;
    if (isEditing) {
      usernameEl.focus();
      // Optional: Cursor ans Ende setzen
      document.execCommand('selectAll', false, null);
      document.getSelection().collapseToEnd();
    }
  }

  // Speichern Button sichtbar machen (falls vorhanden)
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.style.display = isEditing ? 'inline-block' : 'none';

  const tilesContainer = document.getElementById('tilesContainer');
  if (!tilesContainer) return;

  if (isEditing) {
    // Alte Kacheln ausblenden, stattdessen 3 Beispiel-Kacheln + Plus-Kachel anzeigen
    tilesContainer.innerHTML = ''; // Clear all

    // 1: volle Breite (full)
    const full = document.createElement('div');
    full.classList.add('tile', 'full', 'add-tile');
    full.textContent = '+';
    full.title = 'Neue volle Breite Kachel hinzufügen';
    full.onclick = () => openTilePopup('full');
    tilesContainer.appendChild(full);

    // 2: halbe Breite (half)
    const half = document.createElement('div');
    half.classList.add('tile', 'half', 'add-tile');
    half.textContent = '+';
    half.title = 'Neue halbe Breite Kachel hinzufügen';
    half.onclick = () => openTilePopup('half');
    tilesContainer.appendChild(half);

    // 3: quadratisch (square)
    const square = document.createElement('div');
    square.classList.add('tile', 'square', 'add-tile');
    square.textContent = '+';
    square.title = 'Neue quadratische Kachel hinzufügen';
    square.onclick = () => openTilePopup('square');
    tilesContainer.appendChild(square);

  } else {
    // Bearbeitungsmodus aus -> Lade gespeicherte Kacheln neu (aus Firestore oder default)
    loadSavedTiles();
  }

  const editBtn = document.getElementById('editModeBtn');
  if (editBtn) {
    if (isEditing) {
      editBtn.textContent = 'Speichern';
      editBtn.style.backgroundColor = '#4CAF50'; // grün
    } else {
      editBtn.textContent = 'Bearbeiten';
      editBtn.style.backgroundColor = '#e6735f'; // Standardfarbe
      saveSmartBioData();
    }
  }
}

// Lädt die Kacheln aus Firestore neu (oder default)
async function loadSavedTiles() {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const doc = await db.collection('smartbios').doc(user.uid).get();
    if (doc.exists) {
      loadSmartBioData(doc.data());
    }
  } catch (err) {
    console.error('Fehler beim Laden der gespeicherten Kacheln:', err);
  }
}

// Öffnet das Popup zum Kachel hinzufügen mit vorgegebenem Typ
function openTilePopup(type) {
  const popup = document.getElementById('tilePopup');
  if (!popup) return;

  popup.style.display = 'block';
  popup.dataset.type = type;

  // Felder zurücksetzen
  document.getElementById('tileLinkInput').value = '';
  document.getElementById('tileTextInput').value = '';
  document.getElementById('tileImageInput').value = '';
}

// Schließt das Popup
function closeTilePopup() {
  const popup = document.getElementById('tilePopup');
  if (!popup) return;
  popup.style.display = 'none';
  document.getElementById('tileLinkInput').value = '';
  document.getElementById('tileTextInput').value = '';
  document.getElementById('tileImageInput').value = '';
}

// Speichert neue Kachel aus Popup
// Kachel speichern
function saveTileFromPopup() {
  const popup = document.getElementById('tilePopup');
  if (!popup) return;

  const type = popup.dataset.type;
  const link = document.getElementById('tileLinkInput').value.trim();
  const text = document.getElementById('tileTextInput').value.trim();
  const image = document.getElementById('tileImageInput').value.trim();

  if (!link && !text && !image) {
    alert('Bitte mindestens einen Link, Text oder Bild-URL eingeben!');
    return;
  }

  const tilesContainer = document.getElementById('tilesContainer');
  if (!tilesContainer) return;

  const newTile = document.createElement('div');
  newTile.classList.add('tile', type);
  newTile.style.position = 'relative';

  if (link) {
    const a = document.createElement('a');
    a.href = link;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.color = 'inherit';
    a.style.textDecoration = 'none';

    if (text) {
      const textDiv = document.createElement('div');
      textDiv.textContent = text;
      a.appendChild(textDiv);
    }
    if (image) {
      const img = document.createElement('img');
      img.src = image;
      img.alt = text || 'Kachel Bild';
      a.appendChild(img);
    }
    newTile.appendChild(a);
  } else {
    if (text) {
      const textDiv = document.createElement('div');
      textDiv.textContent = text;
      newTile.appendChild(textDiv);
    }
    if (image) {
      const img = document.createElement('img');
      img.src = image;
      img.alt = text || 'Kachel Bild';
      newTile.appendChild(img);
    }
  }

  const plusTile = tilesContainer.querySelector('.add-tile');
  if (plusTile) {
    tilesContainer.insertBefore(newTile, plusTile);
  } else {
    tilesContainer.appendChild(newTile);
  }

  closeTilePopup();
}


  // Füge Kachel ein vor der Plus-Kachel, falls Bearbeitungsmodus an
  const plusTile = tilesContainer.querySelector('.add-tile');
  if (plusTile) {
    tilesContainer.insertBefore(newTile, plusTile);
  } else {
    tilesContainer.appendChild(newTile);
  }

  closeTilePopup();
}

// Theme-Wechsel Funktion
function wechselTheme(name) {
  const link = document.getElementById('themeStylesheet');
  if (link) {
    const allowedThemes = ['boho', 'creme', 'chocolate', 'sunset', 'minimal'];
    if (allowedThemes.includes(name)) {
      link.href = `themes/theme-${name}.css`;
    } else {
      link.href = 'themes/theme-boho.css'; // Fallback
    }
  }
}


// Daten laden und UI befüllen
function loadSmartBioData(data) {
  if (!data) return;

  if (data.profileImage) {
    document.querySelector('.profile-img').src = data.profileImage;
  }
  if (data.bioText) {
    document.getElementById('bioText').textContent = data.bioText;
  }
  if (data.theme) {
    wechselTheme(data.theme);
    document.getElementById('themeDropdown').value = data.theme;
  }

  if (Array.isArray(data.tiles)) {
    const tilesContainer = document.getElementById('tilesContainer');
    tilesContainer.innerHTML = ''; // clear existing

    data.tiles.forEach(tile => {
      const tileDiv = document.createElement('div');
      tileDiv.classList.add('tile');
      tileDiv.classList.add(tile.type || 'full');
      tileDiv.style.position = 'relative';
      tileDiv.contentEditable = false;
      tileDiv.innerHTML = tile.content || '';

      if (tile.image) {
        const img = document.createElement('img');
        img.src = tile.image;
        tileDiv.appendChild(img);
      }
      tilesContainer.appendChild(tileDiv);
    });

    // Add "add-tile" and kachel-optionen if missing (visible nur im Bearbeitungsmodus)
    if (isEditing) {
      if (!tilesContainer.querySelector('.add-tile')) {
        const addTileDiv = document.createElement('div');
        addTileDiv.classList.add('tile', 'add-tile');
        addTileDiv.textContent = '+';
        addTileDiv.title = 'Neue Kachel hinzufügen';
        addTileDiv.onclick = () => openTilePopup('full'); // Default: volle Breite
        tilesContainer.appendChild(addTileDiv);
      }
    }
  }
}

// Default SmartBio-Daten für neue User
function getDefaultSmartBio(email) {
  return {
    username: email.split('@')[0],
    bioText: "Hi, ich bin neu bei SmartBio!",
    profileImage: "images/placeholder.png",
    theme: "boho",
    tiles: [
      { type: "half", content: "Willkommen bei SmartBio!", image: "images/placeholder.png" },
    ]
  };
}

// Daten speichern in Firestore
function saveSmartBioData() {
  const user = auth.currentUser;
  if (!user) {
    showToast("Bitte einloggen!", "error");
    return;
  }

  const profileImage = document.querySelector('.profile-img').src;
  const bioText = document.getElementById('bioText').textContent;
  const theme = document.getElementById('themeDropdown').value;

  const tilesContainer = document.getElementById('tilesContainer');
  const tiles = [];
  tilesContainer.querySelectorAll('.tile').forEach(tile => {
    if (tile.classList.contains('add-tile') || tile.id === 'kachelOptionen') return;
    const type = tile.classList.contains('half') ? 'half' : tile.classList.contains('square') ? 'square' : 'full';
    const content = tile.childNodes[0].textContent || tile.textContent || '';
    const imgEl = tile.querySelector('img');
    const image = imgEl ? imgEl.src : null;
    tiles.push({ type, content, image });
  });

  const smartBioData = {
    username: user.email.split('@')[0],
    bioText,
    profileImage,
    theme,
    tiles
  };

  db.collection('smartbios').doc(user.uid).set(smartBioData)
    .then(() => {
      showToast("SmartBio erfolgreich gespeichert!", "success");
    })
    .catch(err => {
      showToast("Fehler beim Speichern: " + err.message, "error");
    });
}

// Zeige Kachel-Optionen
function zeigeKachelOptionen() {
  const kachelOptionen = document.getElementById('kachelOptionen');
  if (kachelOptionen) {
    kachelOptionen.style.display = kachelOptionen.style.display === 'flex' ? 'none' : 'flex';
  }
}

// Toast-Funktion für Meldungen
function showToast(message, type = 'success', duration = 5000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.classList.add('toast', type);
  toast.textContent = message;

  container.appendChild(toast);

  // Nach Dauer ausblenden
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// Logout-Funktion hinzufügen
function setupLogoutButton() {
  let logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) {
    logoutBtn = document.createElement('button');
    logoutBtn.id = 'logoutBtn';
    logoutBtn.textContent = 'Logout';
    logoutBtn.style.position = 'fixed';
    logoutBtn.style.bottom = '1rem';
    logoutBtn.style.right = '1rem';
    logoutBtn.style.padding = '0.4rem 0.8rem';
    logoutBtn.style.borderRadius = '8px';
    logoutBtn.style.border = 'none';
    logoutBtn.style.background = '#e6735f';
    logoutBtn.style.color = '#fff';
    logoutBtn.style.cursor = 'pointer';
    logoutBtn.style.zIndex = '11000';
    document.body.appendChild(logoutBtn);

    logoutBtn.onclick = async () => {
      await auth.signOut();
      showToast('Erfolgreich ausgeloggt.', 'success');
      // Seite neu laden, um UI zu aktualisieren
      window.location.reload();
    };
  }
}

// --- START ---

window.onload = () => {
  // Firebase Auth Status beobachten
  auth.onAuthStateChanged(async (user) => {
    const header = document.querySelector('header');
    if (user) {
      // Nutzer eingeloggt
      document.getElementById('loginContainer').style.display = 'none';
      document.getElementById('contentContainer').style.display = 'block';
      updateUsernameInHeader(user.email || user.displayName || "User");
      showEditButton();
      setupLogoutButton();

      // Header verstecken
      if (header) header.classList.add('hidden');

      // Lade SmartBio Daten etc.
      try {
        const doc = await db.collection('smartbios').doc(user.uid).get();
        if (doc.exists) {
          loadSmartBioData(doc.data());
        } else {
          loadSmartBioData(getDefaultSmartBio(user.email));
        }
      } catch (error) {
        console.error("Fehler beim Laden der SmartBio-Daten:", error);
      }
    } else {
      // Nutzer nicht eingeloggt
      document.getElementById('loginContainer').style.display = 'block';
      document.getElementById('contentContainer').style.display = 'none';

      // Header anzeigen
      if (header) header.classList.remove('hidden');

      // Logout-Button entfernen falls vorhanden
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) logoutBtn.remove();
    }
  });

  // Login-Link toggle zwischen Registrierung und Login
const toggleLoginLink = document.getElementById('toggleLoginLink');
if (toggleLoginLink) {
  toggleLoginLink.onclick = () => {
    const formTitle = document.getElementById('formTitle');
    const registerBtn = document.getElementById('registerBtn');
    const authMessage = document.getElementById('authMessage');
    
    // Formular zurücksetzen und Meldung entfernen
    document.getElementById('authForm').reset();
    if(authMessage) authMessage.textContent = '';

    if (formTitle.textContent === 'Registrieren') {
      formTitle.textContent = 'Einloggen';
      registerBtn.textContent = 'Einloggen';
    } else {
      formTitle.textContent = 'Registrieren';
      registerBtn.textContent = 'Registrieren & SmartBio erstellen';
    }
  };
}

// Button beim scrollen einblenden/ausblenden

window.addEventListener('scroll', () => {
  const editBtn = document.getElementById('editModeBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (!editBtn || !logoutBtn) return;

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollTop = window.scrollY;

  if (scrollTop > 0) {
    editBtn.style.opacity = '0';
    editBtn.style.pointerEvents = 'none';
  } else {
    editBtn.style.opacity = '1';
    editBtn.style.pointerEvents = 'auto';
  }

  if (scrollTop / scrollableHeight > 0.9) {
    logoutBtn.style.opacity = '1';
    logoutBtn.style.pointerEvents = 'auto';
  } else {
    logoutBtn.style.opacity = '0';
    logoutBtn.style.pointerEvents = 'none';
  }
});

window.addEventListener('load', () => {
  const saveBtn = document.getElementById('saveTileBtn');
  const cancelBtn = document.getElementById('cancelTileBtn');

  if (saveBtn) saveBtn.addEventListener('click', saveTileFromPopup);
  if (cancelBtn) cancelBtn.addEventListener('click', closeTilePopup);
});

// Login/Register Button je nach Modus
const authForm = document.getElementById('authForm');
if (authForm) {
  authForm.onsubmit = async (event) => {
    event.preventDefault();  // Formular-Submit verhindern

    const formTitle = document.getElementById('formTitle').textContent;
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const registerBtn = document.get
    }
  }
}