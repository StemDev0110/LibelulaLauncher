
      function openPics() {
        window.open('https://picsart.com/create', '_blank')
      }
      function openJupiterLabs() {
        window.open('https://jupyterlite.github.io/demo/lab/index.html', '_blank')
      }
      function openWriteGI() {
          window.open('https://www.writerduet.com/script/', '_blank');
      }
      function openDataConf() {
          window.open('../../../../plugins/info-confidencial/index.html', '_blank');
      }
      function openBB() {
          window.open('../../../../plugins/blockbench/index.html', '_blank');
      }
  
      function openCapCut() {
          window.open('https://www.capcut.com/editor?enter_from=picture_Optimiza+tu+flujo+de+trabajo+en+la+nube&from_page=article_page&__action_from=picture_Optimiza+tu+flujo+de+trabajo+en+la+nube&position=picture_Optimiza+tu+flujo+de+trabajo+en+la+nube', '_blank');
      }
  
      function openMil() {
          window.open('https://app.milanote.com/1QCc5O1EYxo3au?p=nBZKJedNE1x', '_blank');
      }
  
      function opentrel() {
          window.open('https://trello.com/invite/espaciodetrabajo34962332/ATTI8b8799325b6a65051d7bacbe4e8fc88425BB9DEB', '_blank');
      }
      function openPaint() {
        window.open('../../../../plugins/minipaint/index.html', '_blank')
      }
      function openPixelart() {
        window.open('../../../../plugins/pixelart/index.html', '_blank')
      }
  
      function openVsC() {
          window.open('https://vscode.dev', '_blank');
      }
  
      function handlePageChange(page) {
          const containers = document.querySelectorAll('.workpanelContainer');
          containers.forEach(container => {
              container.style.display = 'none';
          });
          document.getElementById(`${page}Container`).style.display = 'block';
      }