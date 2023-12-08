function toggleExpanded() {
  const settingsButtons = document.querySelector(".settings-buttons");
  settingsButtons.style.display =
    settingsButtons.style.display === "none" ? "block" : "none";
  const expandButton = document.getElementById("expand-button");
  expandButton.src =
    settingsButtons.style.display === "none"
      ? "./src/assets/textures/icons/expanded-ico.png"
      : "./src/assets/textures/icons/expand-ico.png";
}
function toggleExpanded2() {
  const settingsButtons = document.querySelector(".settings-buttons2");
  settingsButtons.style.display =
    settingsButtons.style.display === "none" ? "block" : "none";
  const expandButton = document.getElementById("expand-button2");
  expandButton.src =
    settingsButtons.style.display === "none"
      ? "./src/assets/textures/icons/expanded-ico.png"
      : "./src/assets/textures/icons/expand-ico.png";
}
function toggleExpanded1() {
  const settingsButtons = document.querySelector(".settings-buttons1");
  settingsButtons.style.display =
    settingsButtons.style.display === "none" ? "block" : "none";
  const expandButton = document.getElementById("expand-button1");
  expandButton.src =
    settingsButtons.style.display === "none"
      ? "./src/assets/textures/icons/expanded-ico.png"
      : "./src/assets/textures/icons/expand-ico.png";
}
