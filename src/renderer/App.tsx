import React, { useEffect, useState } from 'react';
import './App.css';
import config from '../../assets/config.png';
import logo from '../../assets/Libelula_Studio_no_fondo.png';
import list from '../../assets/list.png';

export default function App() {
  const [isListVisible, setListVisible] = useState(false);
  const [versions, setVersions] = useState([]);

  function StartLogin() {
    // calling IPC exposed from preload script
    window.electron.ipcRenderer.sendMessage('ipc-example', ['ping']);
  }

  function toggleListVisibility() {
    setListVisible(!isListVisible);
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://pastebin.com/raw/gs8GeVfm');
        const data = await response.json();
        setVersions(data.versiones);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const renderedItems = () => {
    return (
      versions &&
      Object.keys(versions).map((versionName) => {
        const version = versions[versionName];
        return (
          <li key={versionName} onClick={() => setVersion(version)}>
            {versionName}
          </li>
        );
      })
    );
  };
  useEffect(() => {
    const initDB = async () => {
      if (!('indexedDB' in window)) {
        console.error('IndexedDB is not supported');
        return;
      }

      // Abrir o crear la base de datos
      const request = window.indexedDB.open('database-main', 1);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBRequest<IDBDatabase>).result;
        // Crear el almacén de objetos si no existe
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = (event) => {
        const db = (event.target as IDBRequest<IDBDatabase>).result;

        // Verificar si ya existe un jugador almacenado
        const transaction = db.transaction(['settings'], 'readwrite');
        const settingsStore = transaction.objectStore('settings');
        const playerRequest = settingsStore.get('player');

        playerRequest.onsuccess = () => {
          const player = playerRequest.result;
          // Si no hay un jugador almacenado, guardamos 'player' como valor predeterminado
          if (!player) {
            // Usamos add con un objeto que tiene la clave especificada
            settingsStore.add({ key: 'player', value: 'steve' });
          }
        };

        transaction.oncomplete = () => {
          db.close();
        };
      };

      request.onerror = () => {
        console.error('Error opening IndexedDB');
      };
    };

    initDB();
  }, []);

  return (
    <div
      style={{
        alignContent: 'space-between',
        display: 'grid',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <img className="centrar-imagen" src={logo} />
      <div className="header">
        <div className="header-flex">
          <img src={list} alt="List" onClick={toggleListVisibility} />
          <p>Libelula Launcher</p>
          <p>VERSION SELECTED</p>
        </div>
      </div>
      {isListVisible && (
        <div style={{ zIndex: '100' }} className="box-list">
          <p>Versions</p>
          <ul>
            {renderedItems()}
            <li onClick={() => setVersion(null)}>Back</li>
          </ul>
        </div>
      )}
      <div style={{ justifyContent: 'space-between' }} className="footer">
        <img className="config" src={config} alt="" />
        <button>Acceder</button>
        <div style={{ display: 'flex' }}>
          <p>Player</p>
          <img
            onClick={StartLogin}
            src={`https://pnghq.com/wp-content/uploads/minecraft-steve-head-png-transparent-png-download-60893.png`}
            alt="Login"
          />
        </div>
      </div>
    </div>
  );
}
