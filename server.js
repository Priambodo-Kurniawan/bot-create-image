// server.js
/* main.js */
const express = require("express");
const app = express();
var embedUrl = process.env.URL_NETLIFY;

const puppeteer = require('puppeteer');
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create an express route
app.get("/upload", (req, res) => {
  takeScreenshot()
    .then((screenshot) => uploadScreenshot(screenshot))
    .then((result) => res.status(200).json(result))
    .catch(err => {
    console.log(err);
    res.send(err);
  });
});

// See https://bitsofco.de/using-a-headless-browser-to-capture-page-screenshots
async function takeScreenshot() {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 750,
      height: 750,
      isLandscape: true
    },
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.goto(
    embedUrl,
    { waitUntil: 'networkidle2' }
  );

  const screenshot = await page.screenshot({
    omitBackground: true,
    encoding: 'binary'
  });

  await browser.close();

  return screenshot;
}

function uploadScreenshot(screenshot) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {};
    cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) reject(error)
      else resolve(result);
    }).end(screenshot);
  });
}

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});
