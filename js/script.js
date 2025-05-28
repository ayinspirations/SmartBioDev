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

// ------------------------------------------------------

let isEditing = false;

// Helfer, um Username im Header zu setzen
function updateUsernameInHeader(name) {
  const headerUsername = document.getElementById('headerUsername');
  if (headerUsername && name) {
    headerUsername.textContent = name;
  }
}

// Zeigt Bearbeiten Button falls noch nicht da
function showEditButton() {
  const header = document.querySelector('.header');
  if (header.querySelector('#editModeBtn')) return;

  const editBtn = document.createElement('button');
  editBtn.id = 'editModeBtn';
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

// Umschalten Bearbeitungsmodus (deine bestehende Logik)
function toggleEditMode() {
  isEditing = !isEditing;

  const themeSelector = document.getElementById('themeSelector');
  if (themeSelector) {
    themeSelector.style.display = isEditing ? 'block' : 'none';
  }

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
    editBtn.textContent = isEditing ? 'Bearbeiten beenden' : 'Bearbeiten';
  }
}

// Kacheln hinzufügen (dein bestehender Code)
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

// Theme-Wechsel Funktion (dein Original)
function wechselTheme(name) {
  const link = document.getElementById('themeStylesheet');
  if (link) {
    link.href = `themes/theme-${name}.css`;
  }
}

// --- START ---

window.onload = () => {
  const loginContainer = document.getElementById('loginContainer');
  const contentContainer = document.getElementById('contentContainer');
  const authForm = document.getElementById('authForm');
  const formTitle = document.getElementById('formTitle');
  const toggleLoginText = document.getElementById('toggleLoginText');
  const toggleLoginLink = document.getElementById('toggleLoginLink');
  const registerBtn = document.getElementById('registerBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const authMessage = document.getElementById('authMessage');

  let isLoginMode = false; // Start mit Registrierung

  // Firebase Auth Status beobachten
  auth.onAuthStateChanged(user => {
    if (user) {
      loginContainer.style.display = 'none';
      contentContainer.style.display = 'block';
      updateUsernameInHeader(user.email || user.displayName || "User");
      showEditButton();
    } else {
      loginContainer.style.display = 'block';
      contentContainer.style.display = 'none';
    }
  });

  // Umschalten Login <-> Registrierung
  toggleLoginLink.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    authMessage.textContent = "";
    if (isLoginMode) {
      formTitle.textContent = "Einloggen";
      registerBtn.textContent = "Einloggen";
      toggleLoginText.innerHTML = `Noch keinen Account? <span id="toggleLoginLink" style="color: var(--cta); cursor:pointer;">Hier registrieren</span>`;
    } else {
      formTitle.textContent = "Registrieren";
      registerBtn.textContent = "Registrieren & SmartBio erstellen";
      toggleLoginText.innerHTML = `Schon registriert? <span id="toggleLoginLink" style="color: var(--cta); cursor:pointer;">Hier einloggen</span>`;
    }
    // Wichtig: EventListener neu binden wegen innerHTML Update
    document.getElementById('toggleLoginLink').addEventListener('click', () => {
      toggleLoginLink.click();
    });
  });

  // Button Handler für Registrierung und Login
  registerBtn.onclick = async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    if (!email || !password || password.length < 6) {
      authMessage.textContent = 'Bitte gültige E-Mail und Passwort (mindestens 6 Zeichen) eingeben.';
      return;
    }
    authMessage.textContent = '';

    try {
      if (isLoginMode) {
        // Login
        await auth.signInWithEmailAndPassword(email, password);
      } else {
        // Registrierung
        await auth.createUserWithEmailAndPassword(email, password);
        alert('Registrierung erfolgreich! Du bist jetzt eingeloggt.');
        authForm.reset();
      }
    } catch (error) {
      authMessage.textContent = error.message;
    }
  };

  // Logout-Button Handler
  logoutBtn.onclick = async () => {
    try {
      await auth.signOut();
      alert('Du wurdest ausgeloggt.');
      // Optional: Seite neu laden, damit UI zurückgesetzt wird
      window.location.reload();
    } catch (error) {
      alert('Fehler beim Ausloggen: ' + error.message);
    }
  };

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
