// Obtén una referencia a los botones y elementos div
var projectsButton = document.getElementById('projects-button');
var managingButton = document.getElementById('managing-button');
var modelingTexturingButton = document.getElementById('mt-button');
var musicandsoundsButton = document.getElementById('ms-button');
var buildButton = document.getElementById('b-button');
var guionBocetoButton = document.getElementById('gb-button');
var ilustracionesButton = document.getElementById('ilustraciones-button');
var programacionButton = document.getElementById('programacion-button');
var videoandvoiceButton = document.getElementById('vv-button');


// Mantén una lista de IDs de elementos div que deseas controlar
var elementosDiv = ['workpanel', 'managingpanel', 'projectspanel', 'mtpanel', 'mspanel', 'buildpanel', 'gbpanel', 'ipanel', 'programacionpanel', 'vvpanel'];

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
mostrarElemento('workpanel');

// Agrega controladores de eventos para los botones
projectsButton.addEventListener('click', function() {
    mostrarElemento('projectspanel');
});

managingButton.addEventListener('click', function() {
    mostrarElemento('managingpanel');
});

modelingTexturingButton.addEventListener('click', function() {
    mostrarElemento('mtpanel');
});

musicandsoundsButton.addEventListener('click', function() {
    mostrarElemento('mspanel');
});

buildButton.addEventListener('click', function() {
    mostrarElemento('buildpanel');
});

guionBocetoButton.addEventListener('click', function() {
    mostrarElemento('gbpanel');
});

ilustracionesButton.addEventListener('click', function() {
    mostrarElemento('ipanel');
});

programacionButton.addEventListener('click', function() {
    mostrarElemento('programacionpanel');
});

videoandvoiceButton.addEventListener('click', function() {
    mostrarElemento('vvpanel');
});