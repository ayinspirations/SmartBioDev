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

  if (header.querySelector('#editModeBtn')) return;

  const editBtn = document.createElement('button');
  editBtn.id = 'editModeBtn';
  editBtn.textContent = 'Bearbeiten';
  editBtn.style.padding = '0.5rem 1rem';
  editBtn.style.background = '#e6735f';
  editBtn.style.color = '#fff';
  editBtn.style.border = 'none';
  editBtn.style.borderRadius = '8px';
  editBtn.style.cursor = 'pointer';
  // Positioniere über CSS (siehe CSS-Anpassung)
  editBtn.onclick = toggleEditMode;
  header.appendChild(editBtn);
}

// Umschalten Bearbeitungsmodus, Buttontext und Farbe wechseln
function toggleEditMode() {
  isEditing = !isEditing;

  const themeSelector = document.getElementById('themeSelector');
  if (themeSelector) {
    themeSelector.style.display = isEditing ? 'block' : 'none';
  }

  // Speichern Button sichtbar machen (falls vorhanden)
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.style.display = isEditing ? 'inline-block' : 'none';

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
      tile.contentEditable = true;
    } else {
      const existing = tile.querySelector('.remove-btn');
      if (existing) existing.remove();
      tile.contentEditable = false;
    }
  });

  const kachelOptionen = document.getElementById('kachelOptionen');
  if (kachelOptionen) {
    kachelOptionen.style.display = isEditing ? 'flex' : 'none';
  }

  const editBtn = document.getElementById('editModeBtn');
  if (editBtn) {
    if (isEditing) {
      editBtn.textContent = 'Speichern';
      editBtn.style.backgroundColor = '#4CAF50'; // grün
    } else {
      editBtn.textContent = 'Bearbeiten';
      editBtn.style.backgroundColor = '#e6735f'; // Standardfarbe
    }
  }
}

// Kacheln hinzufügen
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
    newTile.innerHTML = prompt('Text für die Kachel:') || 'Neue Kachel (volle Breite)';
    tiles.insertBefore(newTile, document.getElementById('kachelOptionen'));
  }
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

    // Add "add-tile" and kachel-optionen if missing
    if (!tilesContainer.querySelector('.add-tile')) {
      const addTileDiv = document.createElement('div');
      addTileDiv.classList.add('tile', 'add-tile');
      addTileDiv.textContent = '+';
      addTileDiv.onclick = zeigeKachelOptionen;
      tilesContainer.appendChild(addTileDiv);
    }

    if (!document.getElementById('kachelOptionen')) {
      const kachelOptionen = document.createElement('div');
      kachelOptionen.id = 'kachelOptionen';
      kachelOptionen.classList.add('kachel-optionen');
      kachelOptionen.style.display = 'none';
      kachelOptionen.innerHTML = `
        <button onclick="addTile('full')">Rechteckig – ganze Breite</button>
        <button onclick="addTile('half')">Rechteckig – halbe Breite</button>
        <button onclick="addTile('square')">Quadratisch</button>
      `;
      tilesContainer.appendChild(kachelOptionen);
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

  // Registrierungs-Button
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.onclick = async () => {
      const email = document.getElementById('emailInput').value.trim();
      const password = document.getElementById('passwordInput').value.trim();
      if (!email || !password || password.length < 6) {
        showToast('Bitte gültige E-Mail und Passwort (mindestens 6 Zeichen) eingeben.', 'error');
        return;
      }
      try {
        await auth.createUserWithEmailAndPassword(email, password);
        showToast('Registrierung erfolgreich! Du bist jetzt eingeloggt.', 'success');
        document.getElementById('authForm').reset();
      } catch (error) {
        showToast('Fehler bei Registrierung: ' + error.message, 'error');
      }
    };
  }

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

// Login/Register Button je nach Modus
const authForm = document.getElementById('authForm');
if (authForm) {
  authForm.onsubmit = async (event) => {
    event.preventDefault();  // Formular-Submit verhindern

    const formTitle = document.getElementById('formTitle').textContent;
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const registerBtn = document.getElementById('registerBtn');

    if (!email || !password || password.length < 6) {
      showToast('Bitte gültige E-Mail und Passwort (mindestens 6 Zeichen) eingeben.', 'error');
      return false;
    }

    // Button kurz deaktivieren um Doppelklick zu verhindern
    registerBtn.disabled = true;

    try {
      if (formTitle === 'Registrieren') {
        await auth.createUserWithEmailAndPassword(email, password);
        showToast('Registrierung erfolgreich! Du bist jetzt eingeloggt.', 'success');
      } else {
        await auth.signInWithEmailAndPassword(email, password);
        showToast('Login erfolgreich!', 'success');
      }
      authForm.reset();
    } catch (error) {
      // Optional: Fehler etwas benutzerfreundlicher anzeigen
      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Diese E-Mail wird bereits verwendet. Bitte einloggen.';
      } else if (error.code === 'auth/wrong-password') {
        msg = 'Falsches Passwort. Bitte erneut versuchen.';
      } else if (error.code === 'auth/user-not-found') {
        msg = 'Kein Nutzer mit dieser E-Mail gefunden.';
      }
      showToast('Fehler: ' + msg, 'error');
    } finally {
      registerBtn.disabled = false;
    }
    return false;
  };
}


  // Kachel-Optionen Buttons verbinden
  document.querySelectorAll('#kachelOptionen button').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.textContent.includes('Quadratisch') ? 'square' : (btn.textContent.includes('halbe') ? 'half' : 'full');
      addTile(type);
    });
  });

  // Theme-Dropdown Event verbinden
  const themeDropdown = document.getElementById('themeDropdown');
  if (themeDropdown) {
    themeDropdown.addEventListener('change', function () {
      wechselTheme(this.value);
    });
  }

  // Speichern Button event
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) {
    saveBtn.onclick = saveSmartBioData;
  }
};
