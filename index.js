const express = require('express');
const activitiesRouter = require('./routes/activities');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

// Routes
app.use('/api/activities', activitiesRouter);

// EN sayfası
app.get('/en', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ritminiyakala</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background-color: #fff;
        }
        .container {
          text-align: center;
        }
        h1 {
          color: #631C99;
          font-size: 2.5em;
          margin-bottom: 1em;
        }
        p {
          color: #696969;
          font-size: 1.2em;
          margin-bottom: 2em;
        }
        .buttons {
          display: flex;
          gap: 1em;
          justify-content: center;
        }
        a {
          padding: 0.75em 1.5em;
          text-decoration: none;
          color: white;
          border-radius: 0.5em;
          font-weight: bold;
          font-size: 1em;
        }
        .en-btn {
          background-color: #631C99;
        }
        .tr-btn {
          background-color: #FF7E00;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to ritminiyakala</h1>
        <p>Find your next sports adventure</p>
        <div class="buttons">
          <a href="/en" class="en-btn">🇬🇧 English</a>
          <a href="/tr" class="tr-btn">🇹🇷 Türkçe</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// TR sayfası
app.get('/tr', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ritminiyakala</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background-color: #fff;
        }
        .container {
          text-align: center;
        }
        h1 {
          color: #631C99;
          font-size: 2.5em;
          margin-bottom: 1em;
        }
        p {
          color: #696969;
          font-size: 1.2em;
          margin-bottom: 2em;
        }
        .buttons {
          display: flex;
          gap: 1em;
          justify-content: center;
        }
        a {
          padding: 0.75em 1.5em;
          text-decoration: none;
          color: white;
          border-radius: 0.5em;
          font-weight: bold;
          font-size: 1em;
        }
        .en-btn {
          background-color: #631C99;
        }
        .tr-btn {
          background-color: #FF7E00;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>ritminiyakala'ya Hoşgeldin</h1>
        <p>Sonraki spor macerını bul</p>
        <div class="buttons">
          <a href="/en" class="en-btn">🇬🇧 English</a>
          <a href="/tr" class="tr-btn">🇹🇷 Türkçe</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Root route
app.get('/', (req, res) => {
  res.redirect('/en');
});

app.listen(PORT, () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
});