const images = [
  "https://cdn.discordapp.com/attachments/1172439497175203840/1182784676453163058/xdlda.png?ex=6585f511&is=65738011&hm=5ef3dc48e7dc8370a5a8e9d4c18de6acad5059f2ebc5a0167417177fddcaec56&",
];

let currentIndex = 0;
const imageElement = document.querySelector(".rotating-image");
const dotsContainer = document.querySelector(".dots-container");

function setCurrentIndex(index) {
  currentIndex = index;
  updateImage();
}

function updateImage() {
  imageElement.src = images[currentIndex];
  updateDots();
}

// Función para actualizar los puntos (dots)
function updateDots() {
  dotsContainer.innerHTML = ""; // Limpiar los puntos existentes
  for (let i = 0; i < images.length; i++) {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (i === currentIndex) {
      dot.classList.add("active");
    }
    dot.onclick = () => setCurrentIndex(i);
    dotsContainer.appendChild(dot);
  }
}

// Función para cambiar la imagen
function changeImage() {
  currentIndex = (currentIndex + 1) % images.length;
  updateImage();
}

// Auto-rotación de imágenes cada 3 segundos
setInterval(changeImage, 5000); // Cambiado a 3000 para que se actualice cada 3 segundos

// Inicializar la imagen y los puntos
updateImage();
