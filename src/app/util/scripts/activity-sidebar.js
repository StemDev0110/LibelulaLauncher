const { ipcRenderer } = require('electron')
// Llamar al evento 'usersStatus' para obtener los datos de los usuarios
ipcRenderer.send('usersStatus');
const os = require('os');
const fs = require('fs');
const path = require('path');

// Función para cargar y mostrar los datos en el sidebar
function loadUsersData() {
  const minecraftDirectory = getMinecraftDirectory();
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
  const filePath = path.join(minecraftDirectory,'data','users.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo:', err);
      return;
    }

    try {
      const usersData = JSON.parse(data);

      const usersSidebar = document.getElementById('usersSidebar');

      let usersHTML = '';

      usersData.forEach((userData) => {
        const statusColor = userData.data.estado === 'activo' ? 'green' : 'yellow';

        usersHTML += `
          <div class="userContainer">
            <div class="statusCircle" style="background-color: ${statusColor}"></div>
            <div style="display: flex; margin-top: 5px;">
            <div>
            <img src="${userData.data.picture}">
            </div>
            <div>
            <p>${userData.id}</p>
            </div>
            </div>
            <span>${userData.data.mail}@</span>
          </div>
        `;
      });

      usersSidebar.innerHTML = usersHTML;
    } catch (parseError) {
      console.error('Error al analizar el archivo JSON:', parseError);
    }
  });
}

// Llama a la función para cargar los datos cuando la página se carga
window.onload = loadUsersData;
