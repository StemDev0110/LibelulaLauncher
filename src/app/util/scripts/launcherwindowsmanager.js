// Obtén una referencia a los botones y elementos div
var inicioButton = document.getElementById('inicio-button');
var launcherButton = document.getElementById('launcherconfig-button');
var newsWindowButton = document.getElementById('news-button');
var downloadButton = document.getElementById('download-button');
var gameButton = document.getElementById('gameconfig-button');
var accountsButton = document.getElementById('accounts-window-button');
var supportButton = document.getElementById('support-button');
var advancedconfigButton = document.getElementById('advancedconfig-button');

// Mantén una lista de IDs de elementos div que deseas controlar
var elementosDiv = ['minecraft-main', 'launcher-config', 'news-window', 'download-window', 'game-config', 'accounts-window', 'support-window', 'advanced-game-config'];

// Función para mostrar un elemento div y ocultar los demás
function mostrarElemento(elementoID) {
    elementosDiv.forEach(function(id) {
        var div = document.getElementById(id);
        if (id === elementoID) {
            div.style.display = 'block';
        } else {
            div.style.display = 'none';
        }
    });
}

// Mostrar el elemento "minecraft-main" por defecto al cargar la página
mostrarElemento('minecraft-main');

inicioButton.addEventListener('click', function() {
    mostrarElemento('minecraft-main');
});
// Agrega controladores de eventos para los botones
launcherButton.addEventListener('click', function() {
    mostrarElemento('launcher-config');
});

newsWindowButton.addEventListener('click', function() {
    mostrarElemento('news-window');
});
downloadButton.addEventListener('click', function() {
    mostrarElemento('download-window');
});
gameButton.addEventListener('click', function() {
    mostrarElemento('game-config');
});
accountsButton.addEventListener('click', function() {
    mostrarElemento('accounts-window');
});
supportButton.addEventListener('click', function() {
    mostrarElemento('support-window');
});
advancedconfigButton.addEventListener('click', function() {
    mostrarElemento('advanced-game-config');
});