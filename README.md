# NightWolf Kitchen

NightWolf Kitchen on full-stack web-sovellus, jossa käyttäjät voivat selata ravintolan viikoittaista ruokalistaa, jättää tilauksia ja hallinnoida sisältöä (admin-rajapinta). README on jaettu kolmeen osaan: linkit & tekijät, frontend ja backend.

**Mitä projekti tekee**

- Tarjoaa käyttäjäpuolen viikko- ja päivittäisruokalistan selaamiseen.
- Mahdollistaa ruokien tilaamisen sähköisesti.
- Tarjoaa yksinkertaisen admin-rajapinnan ruokalistan ja tilausten hallintaan.

**Miksi projekti on hyödyllinen**

- Nopeuttaa tilausprosessia ja vähentää virheitä puhelintilausten sijaan.
- Helppo integroida olemassa olevaan ravintolan työnkulkuun.
- Hyvä opetusprojekti full-stack-kehityksen käytännöistä (REST, DB, file-upload, auth).

---

**Osa 1 — Linkit ja tekijät**

- Demo (esimerkki): https://example.com/demo
- Palautelomake (esimerkki): https://example.com/feedback
- API-dokumentaatio (esimerkki): https://example.com/api-docs

Tekijät:

- Andrei Tsizikov
- Khaled Marai

Lisätiedot ja kaikki lähteet löytyvät reposta.

---

**Osa 2 — Frontend**

Sijainti: `frontend/`

Sisältö:

- Staattiset HTML-sivut käyttäjälle: `frontend/user_html/`
- Admin-sivut: `frontend/admin_html/`
- CSS ja JavaScript-tiedostot: `frontend/css/`, `frontend/js/`

Pika-aloitus (kehittäjälle, paikallinen kehitys)

1. Avaa selaimessa tiedosto `frontend/user_html/index.html` tai `frontend/admin_html/ruokalista.html` suoraan.
2. Suositeltu: aja paikallinen staattinen palvelin (esim. vs code Live Server laajenus):

3. Avaa http://localhost:5500/user_html/index.html selaimessa.

Huom: Frontend muodostaa API-kutsut backendin osoitteeseen (oletus: `http://localhost:3000`). Jos backend ajetaan eri osoitteessa, muuta `frontend/js/api.js` ja muita vastaava API-url paikoja.

---

**Osa 3 — Backend**

Sijainti: `backend/`

Teknologia: Node.js, Express, MySQL

Pääajotiedosto: `backend/src/index.js`

Riippuvuudet (esimerkki):

- `mysql2`, `dotenv`, `cors`, `multer`, `jsonwebtoken`, `bcrypt`

Tietokanta:

- Esimerkkirakenne löytyy tiedostosta `backend/projekt.sql`.
- Voit tuoda SQL-rakenteen MySQL:ään tai käyttää omaa tietokantaa.

Ympäristömuuttujat (esimerkki `.env`):

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=salasana
DB_DATABASE=nightwolf
JWT_SECRET=oma_salainen_avain
PORT=3000
```

Asennus ja ajo paikallisesti:

```bash
# sijainti backend-kansioon
cd backend
npm install

# luo .env tiedosto yllä olevilla arvoilla

# tuo tietokanta (esim. MySQL Workbench tai mysql CLI)
# mysql -u root -p nightwolf < empty_sql_database_structure.sql

# kehityskäynnistys (nodemon)
npm run dev

# tai normaalisti
npm start
```

API-endpointit ja reitit löytyvät kansiosta `backend/src/api/` (esim. `routes`, `controllers`, `models`).
