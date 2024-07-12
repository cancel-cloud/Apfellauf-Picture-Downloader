const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const url = 'https://kelterei-heil.de/aktion/apfellauf/galerie';
const picturesDir = path.join(__dirname, 'pictures');

// Erstelle den Ordner 'pictures', falls er nicht existiert
if (!fs.existsSync(picturesDir)) {
  fs.mkdirSync(picturesDir);
}

axios.get(url)
  .then(response => {
    const $ = cheerio.load(response.data);
    const images = [];

    $('.site-gallery-flex .site-gallery-item').each((index, element) => {
      const imgSrc = $(element).data('item');
      if (imgSrc) {
        images.push(imgSrc);
      }
    });

    console.log(`Anzahl der Bilder: ${images.length}`);
    return images;
  })
  .then(images => {
    let downloadedCount = 0;

    images.forEach((image, index) => {
      const imgURL = `https://kelterei-heil.de${image}`;
      const imgPath = path.resolve(picturesDir, `image${index + 1}.jpg`);

      axios({
        method: 'get',
        url: imgURL,
        responseType: 'stream'
      }).then(response => {
        response.data.pipe(fs.createWriteStream(imgPath))
          .on('finish', () => {
            downloadedCount++;
            console.log(`Fortschritt: ${downloadedCount}/${images.length} Bilder heruntergeladen.`);
          });
      }).catch(error => {
        console.error(`Fehler beim Herunterladen des Bildes ${imgURL}:`, error);
      });
    });
  })
  .catch(error => {
    console.error('Fehler beim Abrufen der Seite:', error);
  });
