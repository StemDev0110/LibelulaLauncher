const { Client, Authenticator } = require('minecraft-launcher-core');
const { forge, fabric, quilt } = require('tomate-loaders');
const findJava = require('find-java').default;
const {downloadJava} = require('find-java/dist/download.js')
const fs = require('fs');
const https = require('https');
const os = require('os');
const AdmZip = require('adm-zip');
const path = require('path');

let receivedData = {};  // Declara una variable para almacenar los datos recibidos
let selectedFound = false; // Variable para rastrear si se ha encontrado una opción seleccionada
const launcher = new Client();
ipcRenderer.on('all-data', (event, data) => {
  receivedData = data;  // Almacena los datos recibidos en la variable
  // Limpia las opciones actuales en el select
  console.log(receivedData);
  selectElement.innerHTML = "";

  // Itera a través de todos los objetos principales
  for (const projectName in data) {
    if (data.hasOwnProperty(projectName)) {
      const projectData = data[projectName];
      // Verifica si la propiedad 'enabled' es true
      if (projectData.enabled === true) {
        console.log(`${projectName} está habilitado.`);
        // Crea una nueva opción si el proyecto está habilitado
        const option = document.createElement('option');
        option.value = projectName;
        option.textContent = projectName;
        selectElement.appendChild(option);

        // Si no se ha encontrado una opción seleccionada, selecciona esta opción
        if (!selectedFound) {
          selectElement.value = projectName;
          selectedVersion = projectName; // Establecer la versión seleccionada
          selectedFound = true;
        }
      } else {
        console.log(`${projectName} no está habilitado.`);
      }
    }
  }

  // Manejar el cambio de selección aquí después de cargar los datos
  handleSelectChange();
});

ipcRenderer.send('get-all-data');
// Obtener el elemento select
let selectedVersion = null; // Variable para almacenar la versión seleccionada
const selectElement = document.getElementById('version-select');

// Función para manejar el cambio de selección
function handleSelectChange() {
  selectedVersion = selectElement.value;
  console.log(`Seleccionaste: ${selectedVersion}`);
  const startbutton = document.getElementById('launchmc');
  const loading = document.getElementById('loadingicon');
  startbutton.style.display="block";
  loading.style.display="none";
}

// Agregar un manejador de eventos 'change' al select
selectElement.addEventListener('change', handleSelectChange);

// Escuchar el evento y establecer las opciones del select
ipcRenderer.on('project-names', (event, projectNames) => {
  console.log(projectNames); // Asegúrate de que los nombres de proyectos se estén recibiendo aquí

  // Verificar que el elemento select esté presente en el DOM
  if (selectElement) {
    projectNames.forEach((projectName) => {
      const option = document.createElement('option');
      option.value = projectName;
      option.textContent = projectName;
      selectElement.appendChild(option);
    });

    // Si no se ha encontrado una opción seleccionada, selecciona la primera opción habilitada
    if (!selectedFound && projectNames.length > 0) {
      for (const projectName of projectNames) {
        const projectData = receivedData[projectName];
        if (projectData.enabled === true) {
          selectElement.value = projectName;
          selectedVersion = projectName;
          selectedFound = true;
          break;
        }
      }
    }
  } else {
    console.error("Elemento 'version-select' no encontrado en el DOM.");
  }
});

// Solicitar los nombres de proyectos al proceso principal
ipcRenderer.send('get-project-names');
const minecraftDirectory = getMinecraftDirectory();
const downloadLogPath = path.join(minecraftDirectory, 'projects', 'instances_data.json');
function getMinecraftDirectory() {
  switch (os.platform()) {
    case 'win32':
      const win32Path = path.join(os.homedir(), 'AppData', 'Roaming', '.blueprint');
      if (!fs.existsSync(win32Path)) {
        fs.mkdirSync(win32Path, { recursive: true });
      }
      return win32Path;

    case 'darwin':
      const darwinPath = path.join(os.homedir(), 'Library', 'Application Support', 'blueprint');
      if (!fs.existsSync(darwinPath)) {
        fs.mkdirSync(darwinPath, { recursive: true });
      }
      return darwinPath;

    case 'linux':
      const linuxPath = path.join(os.homedir(), '.blueprint');
      if (!fs.existsSync(linuxPath)) {
        fs.mkdirSync(linuxPath, { recursive: true });
      }
      return linuxPath;

    default:
      throw new Error('Sistema operativo no compatible');
  }
}

function isAlreadyDownloaded(selectedVersion, version) {
  if (!fs.existsSync(downloadLogPath)) {
    fs.writeFileSync(downloadLogPath, JSON.stringify({ selectedVersion: { DownloadedVersions: [] } }, null, 2), 'utf8');
  }

  try {
    const downloadLog = JSON.parse(fs.readFileSync(downloadLogPath, 'utf8'));
    const downloadedVersions = downloadLog[selectedVersion] ? downloadLog[selectedVersion].DownloadedVersions : [];
    return downloadedVersions.includes(version);
  } catch (error) {
    return false;
  }
}

function markAsDownloaded(selectedVersion, version) {
  try {
    const downloadLog = JSON.parse(fs.readFileSync(downloadLogPath, 'utf8'));
    if (!downloadLog[selectedVersion]) {
      downloadLog[selectedVersion] = {
        DownloadedVersions: []
      };
    }
    downloadLog[selectedVersion].DownloadedVersions.push(version);
    fs.writeFileSync(downloadLogPath, JSON.stringify(downloadLog, null, 2));
  } catch (error) {
    console.error("Error al marcar como descargado:", error);
  }
}
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(destination);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(`Error al descargar el archivo. Código de estado: ${response.statusCode}`);
        return;
      }

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    });
  });
}

async function extractAndDeleteZip(zipFilePath, destinationDirectory) {
  try {
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(destinationDirectory, true);
    fs.unlinkSync(zipFilePath);
    console.log(`Archivo ZIP descomprimido y eliminado correctamente.`);
  } catch (error) {
    console.error("Error al extraer o eliminar el archivo ZIP:", error);
  }
}
async function downloadAndExtract(versionData) {
  const version = versionData.version;

  if (!isAlreadyDownloaded(selectedVersion, version)) {
    try {
      // Obtiene la ubicación del directorio .minecraft
      const minecraftDirectory = getMinecraftDirectory();
      // Nombre de la carpeta de destino para proyectos
      const projectsFolderName = "projects";
      // Ruta completa de la carpeta de proyectos
      const projectsFolderPath = path.join(minecraftDirectory, projectsFolderName);
      
      const projectFolderName = selectedVersion;

      const projectFolderPath = path.join(projectsFolderPath, projectFolderName);
      // Nombre de la carpeta de destino con el nombre de la versión
      const versionFolderName = version;
      // Ruta completa de la carpeta de versión
      const versionFolderPath = path.join(projectFolderPath, versionFolderName);
      // Nombre del archivo destino en el directorio .minecraft
      const destinationFileName = `${version}.zip`;
      // Ruta completa del archivo de destino
      const destinationPath = path.join(minecraftDirectory, destinationFileName);

      // Descarga el archivo ZIP desde la URL y guárdalo en el directorio .minecraft
      await downloadFile(versionData.archives_url, destinationPath);

      // Crea la carpeta si no existe
      if (!fs.existsSync(projectsFolderPath)) {
        fs.mkdirSync(projectsFolderPath);
      }
      if (!fs.existsSync(projectFolderPath)) {
        fs.mkdirSync(projectFolderPath);
      }
      if (!fs.existsSync(versionFolderPath)) {
        fs.mkdirSync(versionFolderPath);
      }

      // Extrae el contenido del archivo ZIP en la carpeta de versión y borra el archivo ZIP
      await extractAndDeleteZip(destinationPath, versionFolderPath);

      // Marca la versión como descargada
      markAsDownloaded(selectedVersion, version);

      console.log(`Contenido del archivo ZIP extraído y eliminado en la carpeta ${versionFolderName} dentro de "projects".`);
    } catch (error) {
      console.error("Error al descargar, extraer o eliminar el archivo ZIP:", error);
    }
  } else {
    console.log(`Ya tienes el proyecto ${selectedVersion} con la versión (${version}) descargada.`);
  }
}

function openDatabaseAndRetrieveData() {
  const request = indexedDB.open('CuentasDatabase', 1); // Nombre de la base de datos y versión
  request.onerror = (event) => {
    console.error('Error al abrir la base de datos', event.target.error);
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    console.log('Base de datos abierta correctamente');

    // Realiza una transacción para recuperar datos
    const transaction = db.transaction(['cuentas'], 'readonly');
    const objectStore = transaction.objectStore('cuentas');
    const request = objectStore.getAll();

    request.onsuccess = (event) => {
      const accountsFromDatabase = event.target.result;
      console.log('Datos recuperados de la base de datos:', accountsFromDatabase);
      // Realiza las operaciones que necesites con los datos
    };

    request.onerror = (event) => {
      console.error('Error al recuperar datos desde la base de datos', event.target.error);
    };
  };
}

// Llama a la función para abrir la base de datos y recuperar datos
openDatabaseAndRetrieveData();

const minRamSlider = document.getElementById('min-ram');
const maxRamSlider = document.getElementById('max-ram');
const minRamValue = document.getElementById('min-ram-value');
const maxRamValue = document.getElementById('max-ram-value');

// Utiliza path.join para obtener la ruta completa del archivo config.json
const configFilePath = path.join(minecraftDirectory, 'config.json');

function readConfigFile() {
    if (fs.existsSync(configFilePath)) {
        // Si el archivo existe, lee sus valores
        try {
            const rawData = fs.readFileSync(configFilePath);
            const configData = JSON.parse(rawData);
            const initialMinRam = configData.data.rammin;
            const initialMaxRam = configData.data.rammax;

            minRamSlider.value = initialMinRam / 1000;
            maxRamSlider.value = initialMaxRam / 1000;
            updateMinRamValue();
            updateMaxRamValue();
        } catch (error) {
            console.error('Error al leer el archivo config.json:', error);
        }
    } else {
        // Si el archivo no existe, crea uno con valores iniciales
        const initialConfig = {
            data: {
                rammin: 1024, // Valor mínimo inicial (en MB)
                rammax: 4096, // Valor máximo inicial (en MB)
            },
        };

        fs.writeFileSync(configFilePath, JSON.stringify(initialConfig, null, 2));
        // Luego, llama de nuevo a readConfigFile para cargar los valores iniciales.
        readConfigFile();
    }
}

readConfigFile();

minRamSlider.addEventListener('input', updateMinRamValue);
maxRamSlider.addEventListener('input', updateMaxRamValue);

function updateMinRamValue() {
    const minRamAmount = parseInt(minRamSlider.value) * 1000;
    const maxRamAmount = parseInt(maxRamSlider.value) * 1000;
    if (minRamAmount > maxRamAmount) {
        minRamSlider.value = maxRamAmount / 1000;
        minRamValue.textContent = maxRamAmount;
    } else {
        minRamValue.textContent = minRamAmount;
    }

    // Actualizar el archivo config.json con los nuevos valores
    updateConfigFile(minRamAmount, maxRamAmount);
    console.log(`RAM mínimo: ${minRamAmount} MB, RAM máximo: ${maxRamAmount} MB`);
}

function updateMaxRamValue() {
    const maxRamAmount = parseInt(maxRamSlider.value) * 1000;
    const minRamAmount = parseInt(minRamSlider.value) * 1000;
    if (maxRamAmount < minRamAmount) {
        maxRamSlider.value = minRamAmount / 1000;
        maxRamValue.textContent = minRamAmount;
    } else {
        maxRamValue.textContent = maxRamAmount;
    }

    // Actualizar el archivo config.json con los nuevos valores
    updateConfigFile(minRamAmount, maxRamAmount);
    console.log(`RAM mínimo: ${minRamAmount} MB, RAM máximo: ${maxRamAmount} MB`);
}

function updateConfigFile(minRam, maxRam) {
    try {
        const rawData = fs.readFileSync(configFilePath);
        const configData = JSON.parse(rawData);
        configData.data.rammin = minRam;
        configData.data.rammax = maxRam;

        fs.writeFileSync(configFilePath, JSON.stringify(configData, null, 2));
    } catch (error) {
        console.error('Error al actualizar el archivo config.json:', error);
    }
}



async function ManagLaunch() {
  // Verificar si la carpeta 'projects' no existe y crearla si es necesario
  const projectsDirectory = path.join(minecraftDirectory, 'projects');
  if (!fs.existsSync(projectsDirectory)) {
    fs.mkdirSync(projectsDirectory);
} else {


  if (selectedVersion && receivedData[selectedVersion]) {
    // Obtiene los datos necesarios para iniciar Minecraft
    const startbutton = document.getElementById('launchmc');
    const loading = document.getElementById('loadingicon');
    loading.style.display = "block";
    startbutton.style.display = "none";
    const versionData = receivedData[selectedVersion];
    // Acceder a los elementos interiores de versionData y asignarlos a variables
    const mcversion = versionData.mcversion;
    const mclaunch = versionData.launcher;
    const downloaddata = versionData.archives_url;
    const version = versionData.version;
    const java = await findJava(
      { min: 17, optimal: 18 },
      'temp', // tmp path
      'my-folder/java-folder', // download path
      undefined,
      (progress) => {
        console.log(progress * 100 + '%');
      }
    );
    const minRam = parseInt(maxRamSlider.value)
    const maxRam = parseInt(minRamSlider.value)
    // Obtener la cuenta en la que está iniciada la sesión actualmente desde IndexedDB
    const currentSessionAccount = await getCurrentSessionAccount();

    if (currentSessionAccount) {
      // Verificar el estado isPremium de la cuenta
      const nickNameAccount = currentSessionAccount.name;
      const token = currentSessionAccount.profile;
      if (currentSessionAccount.isPremium === true) {
        console.log(`La cuenta ${currentSessionAccount.name} está en sesión y es Premium.`);
        // Realiza las acciones necesarias para una cuenta Premium
        let opt;
        if (versionData.launcher === 'forge') {
          const launchConfig = await forge.getMCLCLaunchConfig({
            gameVersion: mcversion,
            rootPath: path.join(minecraftDirectory, 'projects', selectedVersion, version),
          });
          opt = {
            ...launchConfig,
            authorization: token,
            clientPackage: null,
            javaPath: java,
            java: true,
            memory: {
              max: maxRam,
              min: minRam
            }
          };
        } else if (versionData.launcher === 'fabric') {
          const launchConfig = await fabric.getMCLCLaunchConfig({
            gameVersion: mcversion,
            rootPath: path.join(minecraftDirectory, 'projects', selectedVersion, version),
          });
          opt = {
            ...launchConfig,
            authorization: token,
            clientPackage: null,
            javaPath: java,
            java: true,
            memory: {
              max: maxRam,
              min: minRam
            }
          };
        } else if (versionData.launcher === 'quilt') {
          opt = {
            authorization: token,
            clientPackage: null,
            root: path.join(minecraftDirectory, 'projects', selectedVersion, version),
            javaPath: java,
            java: true,
            version: {
              number: mcversion,
              type: mclaunch
            },
            memory: {
              max: maxRam,
              min: minRam
            }
          };
        } else {
          opt = {
            authorization: token,
            clientPackage: null,
            root: path.join(minecraftDirectory, 'projects', selectedVersion, version),
            javaPath: java,
            java: true,
            version: {
              number: mcversion,
              type: mclaunch
            },
            memory: {
              max: maxRam,
              min: minRam
            }
          };
        }
        launcher.launch(opt);
        console.log(opt)
        launcher.on('debug', (e) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const debugDiv = document.getElementById('debugpc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(e);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          debugDiv.appendChild(br);
          debugDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          debugDiv.scrollTop = debugDiv.scrollHeight;
        });
        launcher.on('progress', (e) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const progressDiv = document.getElementById('progresspc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(e);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          progressDiv.appendChild(br);
          progressDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          progressDiv.scrollTop = progressDiv.scrollHeight;
        });
        launcher.on('download', (e) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const downloadDiv = document.getElementById('downloadpc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(e);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          downloadDiv.appendChild(br);
          downloadDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          downloadDiv.scrollTop = downloadDiv.scrollHeight;
        });
        launcher.on('data', (e) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const dataDiv = document.getElementById('datapc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(e);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          dataDiv.appendChild(br);
          dataDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          dataDiv.scrollTop = dataDiv.scrollHeight;
        });
        launcher.on('error', (err) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const errorDiv = document.getElementById('errorpc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(err);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          errorDiv.appendChild(br);
          errorDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          errorDiv.scrollTop = errorDiv.scrollHeight;
        });
        document.getElementById("launchmc").classList.add("start");
        launcher.on('close', (code) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const closeDiv = document.getElementById('closepc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(code);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          closeDiv.appendChild(br);
          closeDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          closeDiv.scrollTop = closeDiv.scrollHeight;
          document.getElementById("launchmc").classList.remove("start");
          document.getElementById("launchmc").style.display="block";
          document.getElementById("loadingicon").style.display="none";
        });
      } else {
        console.log(`La cuenta ${currentSessionAccount.name} está en sesión pero no es Premium.`);
        // Realiza las acciones necesarias para una cuenta no Premium
        let opt = {
          authorization: Authenticator.getAuth(nickNameAccount),
          clientPackage: null,
          root: path.join(minecraftDirectory, 'projects', selectedVersion, version),
          javaPath: java,
          java: true,
          version: {
            number: mcversion,
            type: mclaunch
          },
          memory: {
            max: maxRam,
            min: minRam
          }
        };
        launcher.launch(opt);
        launcher.on('debug', (e) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const debugDiv = document.getElementById('debugpc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(e);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          debugDiv.appendChild(br);
          debugDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          debugDiv.scrollTop = debugDiv.scrollHeight;
        });
        launcher.on('progress', (e) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const progressDiv = document.getElementById('progresspc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(e);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          progressDiv.appendChild(br);
          progressDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          progressDiv.scrollTop = progressDiv.scrollHeight;
        });
        launcher.on('download', (e) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const downloadDiv = document.getElementById('downloadpc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(e);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          downloadDiv.appendChild(br);
          downloadDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          downloadDiv.scrollTop = downloadDiv.scrollHeight;
        });
        launcher.on('data', (e) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const dataDiv = document.getElementById('datapc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(e);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          dataDiv.appendChild(br);
          dataDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          dataDiv.scrollTop = dataDiv.scrollHeight;
        });
        launcher.on('error', (err) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const errorDiv = document.getElementById('errorpc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(err);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          errorDiv.appendChild(br);
          errorDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          errorDiv.scrollTop = errorDiv.scrollHeight;
        });
        document.getElementById("launchmc").classList.add("start");
        launcher.on('close', (code) => {
          // Crea un elemento <br> y un nodo de texto con el mensaje de depuración
          const closeDiv = document.getElementById('closepc');
          const br = document.createElement('br');
          const textNode = document.createTextNode(code);
        
          // Agrega el <br> y el nodo de texto al elemento 'div' de depuración
          closeDiv.appendChild(br);
          closeDiv.appendChild(textNode);
        
          // Haz scroll hacia abajo para mostrar el último mensaje de depuración
          closeDiv.scrollTop = closeDiv.scrollHeight;
          document.getElementById("launchmc").classList.remove("start");
          document.getElementById("launchmc").style.display="block";
          document.getElementById("loadingicon").style.display="none";
        });
      }
    } else {
      console.error("No se puede iniciar el juego porque no se ha seleccionado una cuenta válida.");
    }

    await downloadAndExtract(versionData);
  } else {
    console.error("No se puede iniciar el juego porque no se ha seleccionado una versión válida.");
  }
}


// Función para obtener la cuenta en sesión actualmente desde IndexedDB
async function getCurrentSessionAccount() {
  const request = indexedDB.open('CuentasDatabase', 1); // Nombre de la base de datos y versión

  return new Promise((resolve, reject) => {
    request.onerror = (event) => {
      console.error('Error al abrir la base de datos', event.target.error);
      reject(null);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;

      // Realiza una transacción para obtener la cuenta con el estado de inicio de sesión actual en true
      const transaction = db.transaction(['cuentas'], 'readonly');
      const objectStore = transaction.objectStore('cuentas');
      const request = objectStore.getAll();

      request.onsuccess = (event) => {
        const accountsFromDatabase = event.target.result;

        // Busca la cuenta que tiene el estado de inicio de sesión actual (currentSession) en true
        const sessionAccount = accountsFromDatabase.find(account => account.currentSession === true);

        resolve(sessionAccount);
      };

      request.onerror = (event) => {
        console.error('Error al cargar las cuentas desde la base de datos', event.target.error);
        reject(null);
      };
    };
  });
}
}

try {
  // Lee el archivo minecraft.json de forma sincrónica
  const rawdata = fs.readFileSync(downloadLogPath);
  const minecraftConfig = JSON.parse(rawdata);
  const projects = "projects";
  
    // Obtén todas las claves de nivel superior en el JSON
    for (const objetoPrincipal in minecraftConfig) {
      if (minecraftConfig.hasOwnProperty(objetoPrincipal)) {
        const subobjeto = minecraftConfig[objetoPrincipal];
        
        // Verifica si existe la clave "DownloadedVersions" en el subobjeto
        if (subobjeto["DownloadedVersions"]) {
          const downloadedVersions = subobjeto["DownloadedVersions"];
          
                // Crea un div por cada versión y agrega al elemento con la ID "game-config"
                const gameConfigDiv = document.getElementById("versions-mng-list");
                downloadedVersions.forEach(version => {
                    const div = document.createElement("div");
                    div.className = "account-box";
                    div.innerHTML = `<div class="account-info"><span>${objetoPrincipal}<br/>${version}</span></div>`;

                    // Crea un botón "Eliminar" para cada div
                    const eliminarButton = document.createElement("button");
                    eliminarButton.className = "version-actions";
                    eliminarButton.textContent = "Eliminar";
                    eliminarButton.addEventListener("click", () => {
                        // Elimina la versión del subobjeto
                        const index = subobjeto["DownloadedVersions"].indexOf(version);
                        if (index !== -1) {
                            subobjeto["DownloadedVersions"].splice(index, 1);
                            // Si no quedan subversiones, elimina el subobjeto del objeto principal
                            if (subobjeto["DownloadedVersions"].length === 0) {
                                delete minecraftConfig[objetoPrincipal];
                            }
                            // Actualiza la visualización
                            gameConfigDiv.removeChild(div);
                            // Guarda el JSON actualizado en el archivo
                            fs.writeFileSync(downloadLogPath, JSON.stringify(minecraftConfig, null, 2));
                            const carpetaToDelete = path.join(minecraftDirectory, projects, objetoPrincipal, version);
                            try {
                              fs.rmdirSync(carpetaToDelete, { recursive: true });
                              console.log(`Carpeta ${carpetaToDelete} eliminada correctamente.`);
                            } catch (error) {
                              console.error("Error al eliminar la versión: ", error);
                            }
                        }
                    });

                    // Agrega el botón "Eliminar" al div
                    div.appendChild(eliminarButton);
                    gameConfigDiv.appendChild(div);
                });
            } else {
                console.error(`El objeto principal "${objetoPrincipal}" no contiene la vclae "DownloadedVersions".`);
            }
        }
    }
} catch (error) {
    console.error("Error al leer o analizar el archivo JSON:", error);
}