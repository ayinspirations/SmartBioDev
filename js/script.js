// ---------------- Firebase Config ----------------
const firebaseConfig = {
  apiKey: "AIzaSyBCTa_qffHHhvauBdJQVyTlMhMmmbN3rag",
  authDomain: "smartbio-app.firebaseapp.com",
  projectId: "smartbio-app",
  storageBucket: "smartbio-app.firebasestorage.app",
  messagingSenderId: "778331841333",
  appId: "1:778331841333:web:4865dc2f0575a7b19c627c"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let isEditing = false;

// Username im Header setzen
function updateUsernameInHeader(name) {
  const headerUsername = document.getElementById('headerUsername');
  if (headerUsername && name) {
    headerUsername.textContent = name;
  }
}

// Bearbeiten-Button einfügen
function showEditButton() {
  const header = document.querySelector('.header');
  if (!header) return;

  const lowerBtn = document.querySelector('.btn.bearbeiten-unten');
  if (lowerBtn) lowerBtn.remove();

  if (document.getElementById('editModeBtn')) return;

  const editBtn = document.createElement('button');
  editBtn.id = 'editModeBtn';
  editBtn.textContent = 'Bearbeiten';
  editBtn.onclick = toggleEditMode;
  document.body.appendChild(editBtn);
}

// Umschalten zwischen Bearbeitungs- und Ansichtsmodus
function toggleEditMode() {
  isEditing = !isEditing;

  const themeSelector = document.getElementById('themeSelector');
  if (themeSelector) {
    themeSelector.style.display = isEditing ? 'block' : 'none';
  }

  const usernameEl = document.getElementById('headerUsername');
  if (usernameEl) {
    usernameEl.contentEditable = isEditing;
    if (isEditing) {
      usernameEl.focus();
      document.execCommand('selectAll', false, null);
      document.getSelection().collapseToEnd();
    }
  }

  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.style.display = isEditing ? 'inline-block' : 'none';

  const tilesContainer = document.getElementById('tilesContainer');
  if (!tilesContainer) return;

  if (isEditing) {
    tilesContainer.innerHTML = '';

    ['full', 'half', 'square'].forEach(type => {
      const tile = document.createElement('div');
      tile.classList.add('tile', type, 'add-tile');
      tile.textContent = '+';
      tile.title = `Neue ${type}-Kachel hinzufügen`;
      tile.onclick = () => openTilePopup(type);
      tilesContainer.appendChild(tile);
    });

  } else {
    loadSavedTiles();
  }

  const editBtn = document.getElementById('editModeBtn');
  if (editBtn) {
    editBtn.textContent = isEditing ? 'Speichern' : 'Bearbeiten';
    editBtn.style.backgroundColor = isEditing ? '#4CAF50' : '#e6735f';

    if (!isEditing) saveSmartBioData();
  }
}
// Lädt gespeicherte Kacheln neu aus Firestore
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

// Öffnet das Popup zum Kachel-Hinzufügen
function openTilePopup(type) {
  const popup = document.getElementById('tilePopup');
  if (!popup) return;

  popup.style.display = 'block';
  popup.dataset.type = type;

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

    if (isEditing && !tilesContainer.querySelector('.add-tile')) {
      const addTileDiv = document.createElement('div');
      addTileDiv.classList.add('tile', 'add-tile');
      addTileDiv.textContent = '+';
      addTileDiv.title = 'Neue Kachel hinzufügen';
      addTileDiv.onclick = () => openTilePopup('full');
      tilesContainer.appendChild(addTileDiv);
    }
  }
}

// Default-Daten für neue Nutzer
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
  const themeDropdown = document.getElementById('themeDropdown');
if (themeDropdown) {
  themeDropdown.addEventListener('change', (event) => {
    wechselTheme(event.target.value);
  });
}

  const tilesContainer = document.getElementById('tilesContainer');
  const tiles = [];
  tilesContainer.querySelectorAll('.tile').forEach(tile => {
    if (tile.classList.contains('add-tile') || tile.id === 'kachelOptionen') return;
    const type = tile.classList.contains('half') ? 'half' : tile.classList.contains('square') ? 'square' : 'full';
    const content = tile.childNodes[0]?.textContent || tile.textContent || '';
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
      window.location.reload(); // UI aktualisieren
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

      if (header) header.classList.add('hidden');

      // SmartBio laden
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
      // Nicht eingeloggt
      document.getElementById('loginContainer').style.display = 'block';
      document.getElementById('contentContainer').style.display = 'none';
      if (header) header.classList.remove('hidden');
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

  // Button beim Scrollen einblenden/ausblenden
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
      event.preventDefault();

      const formTitle = document.getElementById('formTitle').textContent.trim();
      const email = document.getElementById('emailInput').value.trim();
      const password = document.getElementById('passwordInput').value.trim();

      try {
        if (formTitle.toLowerCase().includes("registrieren")) {
          await auth.createUserWithEmailAndPassword(email, password);
        } else {
          await auth.signInWithEmailAndPassword(email, password);
        }

        // Sichtbarkeit ändern nach erfolgreichem Login
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';

        // Optional: Username setzen, falls vorhanden
        const user = auth.currentUser;
        if (user) {
          updateUsernameInHeader(user.displayName || user.email.split("@")[0]);
        }
      } catch (error) {
        alert("Fehler: " + error.message);
      }
    };
  }

  window.addEventListener('load', () => {
  const tilesContainer = document.getElementById('tilesContainer');

  if (tilesContainer) {
    new Sortable(tilesContainer, {
      animation: 150,
      ghostClass: 'drag-ghost',
      direction: 'horizontal', // Hier ergänzt für nebeneinander Verschieben
      swapThreshold: 0.65,      // Optional für bessere Swap-Erkennung
      fallbackOnBody: true,
      scroll: true,
      onEnd: function (evt) {
        console.log(`Kachel verschoben von ${evt.oldIndex} nach ${evt.newIndex}`);
        // Optional: Hier neue Reihenfolge speichern (z.B. Firestore)
      }
    });
  }
});
};
