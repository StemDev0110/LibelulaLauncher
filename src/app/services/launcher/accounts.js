const { ipcRenderer } = require('electron');
const { Auth } = require("msmc");
// Variables globales para mantener un seguimiento de las cuentas de usuario
const accounts = [];
let currentSessionAccount = "Player"; // Declararla como una variable global con un valor predeterminado
const authManager = new Auth("select_account");

// Función para mostrar la lista de cuentas
const loginOptionMicrosoft = document.getElementById('loginOptionPremium');

function CreateAccountPremium() {
  authManager.launch("raw").then(async xboxManager => {
    const token = await xboxManager.getMinecraft();
    console.log(token);
    const profile = token.mclc();
    const NewPremiumAccount = {
      name: profile.name,
      isPremium: true,
      profile,
    };
    console.log(NewPremiumAccount);
    addAccountToDatabase(NewPremiumAccount);
    loadAccountsFromDatabase();
  });
  const selectcreationOverlay = document.getElementById("selectcreationoverlay");
  selectcreationOverlay.style.display = "none";
}

function displayAccounts() {
  const accountList = document.querySelector(".account-list");
  accountList.innerHTML = ""; // Limpiar la lista antes de volver a mostrarla

  accounts.forEach((account, index) => {
    const accountBox = document.createElement("div");
    accountBox.classList.add("account-box");
    accountBox.innerHTML = `
      <div class="account-info">
        <span>${account.name}</span>
        <img src="https://visage.surgeplay.com/bust/${encodeURIComponent(
          account.name
        )}.png" 
        alt="${account.name}'s Skin" 
        onerror="this.onerror=null; this.src='https://visage.surgeplay.com/bust/badc048a7ce78f7dad72a07da27d85c0916881e5522eeed1e3daf217a38c1a.png';">
      </div>
      <div class="account-actions">
        <button onclick="${account.isPremium ? 'inicioSession' : 'inicioSession'}('${account.name}')">
          Iniciar Sesion - ${account.isPremium ? 'Online' : 'Offline'}
        </button>
        <button onclick="deleteAccount(${index})">Eliminar</button>
      </div>
    `;
    accountList.appendChild(accountBox);
  });
}

// Función para abrir la base de datos
let db; // Variable global para la base de datos
function openDatabase() {
  const request = indexedDB.open('CuentasDatabase', 1); // Nombre de la base de datos y versión
  request.onerror = (event) => {
    console.error('Error al abrir la base de datos', event.target.error);
  };

  request.onsuccess = (event) => {
    db = event.target.result;
    console.log('Base de datos abierta correctamente');
    
    // Consultar la información de inicio de sesión actual desde la base de datos
    retrieveSessionStateFromDatabase();
    
    // Una vez abierta la base de datos, puedes cargar los datos existentes si los hay.
    loadAccountsFromDatabase();
  };

  request.onupgradeneeded = (event) => {
    const database = event.target.result;
    const objectStore = database.createObjectStore('cuentas', { keyPath: 'name' });

    objectStore.createIndex('isPremium', 'isPremium', { unique: false });
  };
}
// Función para consultar la información de inicio de sesión actual desde la base de datos
function retrieveSessionStateFromDatabase() {
  const transaction = db.transaction(['cuentas'], 'readonly');
  const objectStore = transaction.objectStore('cuentas');
  const request = objectStore.getAll();

  request.onsuccess = (event) => {
    const accountsFromDatabase = event.target.result;

    // Buscar la cuenta que tiene el estado de inicio de sesión actual (currentSession) en true
    const sessionAccount = accountsFromDatabase.find(account => account.currentSession === true);

    if (sessionAccount) {
      console.log(`Inicio de sesión actual: ${sessionAccount.name}`);
      // Actualizar la variable global currentSessionAccount
      currentSessionAccount = sessionAccount.name;
      // Iniciar sesión en la nueva cuenta
      const playerNameElement = document.querySelector(".playerName");
      playerNameElement.textContent = `${sessionAccount.name}`;
      // También puedes realizar cualquier acción adicional que desees aquí
    } else {
      console.log('No hay sesión activa. Iniciando sesión como "Player".');
    }

    // Actualiza la matriz de cuentas con los datos de la base de datos
    accounts.length = 0; // Limpiar la matriz de cuentas existentes
    accountsFromDatabase.forEach((account) => {
      accounts.push(account);
    });
    displayAccounts(); // Actualizar la interfaz con las cuentas cargadas
  };

  request.onerror = (event) => {
    console.error('Error al cargar las cuentas desde la base de datos', event.target.error);
  };
}



// Función para agregar una nueva cuenta a la base de datos
function addAccountToDatabase(account) {
  const transaction = db.transaction(['cuentas'], 'readwrite');
  const objectStore = transaction.objectStore('cuentas');
  const request = objectStore.add(account);

  request.onsuccess = () => {
    console.log(`Cuenta agregada a la base de datos: ${account.name}`);
    if (account.name === currentSessionAccount) {
      // Si la cuenta agregada es la cuenta de inicio de sesión actual, actualiza su estado de inicio de sesión
      updateSessionStateInDatabase(account.name);
    }
  };

  request.onerror = (event) => {
    console.error('Error al agregar la cuenta a la base de datos', event.target.error);
  };
}

// Función para cargar las cuentas desde la base de datos y mostrarlas en la interfaz
function loadAccountsFromDatabase() {
  const transaction = db.transaction(['cuentas'], 'readonly');
  const objectStore = transaction.objectStore('cuentas');
  const request = objectStore.getAll();

  request.onsuccess = (event) => {
    const accountsFromDatabase = event.target.result;
    accounts.length = 0; // Limpiar la matriz de cuentas existentes

    accountsFromDatabase.forEach((account) => {
      accounts.push(account);
    });

    displayAccounts(); // Actualizar la interfaz con las cuentas cargadas
  };

  request.onerror = (event) => {
    console.error('Error al cargar las cuentas desde la base de datos', event.target.error);
  };
}
// Función para eliminar una cuenta
function deleteAccount(index) {
  if (index >= 0 && index < accounts.length) {
    const deletedAccount = accounts[index];

    // Verificar si la cuenta que se está eliminando está en sesión
    if (currentSessionAccount === deletedAccount.name) {
      currentSessionAccount = "Player"; // Cambiar a la cuenta predeterminada (en este caso, "Player")
      const playerNameElement = document.querySelector(".playerName");
      playerNameElement.textContent = currentSessionAccount;
      console.log(`Cerrando sesión en: ${deletedAccount.name}. Cambiando a: ${currentSessionAccount}`);
    }

    accounts.splice(index, 1);
    // Elimina la cuenta también de la base de datos
    deleteAccountFromDatabase(deletedAccount.name);
    displayAccounts();
    console.log(`Cuenta eliminada: ${deletedAccount.name}`);
  }
}

// Función para eliminar una cuenta de la base de datos
function deleteAccountFromDatabase(accountName) {
  const transaction = db.transaction(['cuentas'], 'readwrite');
  const objectStore = transaction.objectStore('cuentas');
  const request = objectStore.delete(accountName);

  request.onsuccess = () => {
    console.log(`Cuenta eliminada de la base de datos: ${accountName}`);
  };

  request.onerror = (event) => {
    console.error('Error al eliminar la cuenta de la base de datos', event.target.error);
  };
}

// Función para actualizar una cuenta en la base de datos
function updateAccountInDatabase(account) {
  const transaction = db.transaction(['cuentas'], 'readwrite');
  const objectStore = transaction.objectStore('cuentas');
  const request = objectStore.put(account);

  request.onsuccess = () => {
    console.log(`Cuenta actualizada en la base de datos: ${account.name}`);
  };

  request.onerror = (event) => {
    console.error('Error al actualizar la cuenta en la base de datos', event.target.error);
  };
}

function toggleAccountSelectCreation() {
  const selectcreationOverlay = document.getElementById("selectcreationoverlay");
  selectcreationOverlay.style.display = "flex";
}
  
// Función para mostrar el formulario de creación de cuenta
function toggleAccountCreation() {
  const creationOverlay = document.getElementById("creationoverlay");
  creationOverlay.style.display = "flex";
} 
// Función para guardar una nueva cuenta
document.getElementById("saveAccount").addEventListener("click", () => {
  const accountNameInput = document.getElementById("accountNameInput");
  const accountName = accountNameInput.value.trim();

  if (accountName) {
    const newAccount = {
      name: accountName,
      isPremium: false, // Define si la cuenta es premium o no
    };
    addAccountToDatabase(newAccount); // Usa la función addAccountToDatabase para guardar la cuenta en la base de datos
    accountNameInput.value = "";
    const creationOverlay = document.getElementById("creationoverlay");
    creationOverlay.style.display = "none";
    const selectcreationOverlay = document.getElementById("selectcreationoverlay");
    selectcreationOverlay.style.display = "none";

    // Después de agregar la cuenta, carga los datos nuevamente desde la base de datos
    loadAccountsFromDatabase();
  }
});


  function deleteAccountTransmiter() {
    return deletedAccountName;
  }
  function createNPAccountTransmiter(name) {
    return name;
  }
  
// Función para iniciar sesión en una cuenta
function inicioSession(accountName) {
  // Esta función se llama cuando se hace clic en el botón "Iniciar Sesión - NoPremium"

  // Cerrar sesión en la cuenta actual si hay una
  console.log(`Cerrando sesión en: ${currentSessionAccount}`);

  // Buscar la cuenta actualmente en sesión y cambiar su estado a false si existe
  const currentSessionAccountObj = accounts.find((account) => account.currentSession === true);
  if (currentSessionAccountObj) {
    currentSessionAccountObj.currentSession = false;
    updateAccountInDatabase(currentSessionAccountObj);
  }

  // Iniciar sesión en la nueva cuenta
  currentSessionAccount = accountName;
  const playerNameElement = document.querySelector(".playerName");
  playerNameElement.textContent = accountName;
  console.log(`Iniciado Session: ${accountName}`);

  // Guardar el estado de inicio de sesión actual en la base de datos
  updateSessionStateInDatabase(accountName);
}
// Función para actualizar el estado de inicio de sesión actual en la base de datos
function updateSessionStateInDatabase(accountName) {
  const transaction = db.transaction(['cuentas'], 'readwrite');
  const objectStore = transaction.objectStore('cuentas');
  const request = objectStore.get(accountName);

  request.onsuccess = (event) => {
    const account = event.target.result;
    if (account) {
      account.currentSession = true; // Establece el estado de inicio de sesión actual en true
      updateAccountInDatabase(account); // Actualiza la cuenta en la base de datos
    }
  };

  request.onerror = (event) => {
    console.error('Error al obtener la cuenta de la base de datos', event.target.error);
  };
}
// Manejar el evento beforeunload para guardar la información de inicio de sesión
window.addEventListener('beforeunload', () => {
  if (currentSessionAccount !== "Player") {
    // Si la sesión actual no es "Player", guarda la información de inicio de sesión en la base de datos
    updateSessionStateInDatabase(currentSessionAccount);
  }
});

openDatabase();
// En el segundo código
