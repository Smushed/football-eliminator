require(`dotenv`).config();

const express = require(`express`);
const path = require(`path`);
const PORT = process.env.PORT || 3001;
const app = express();

const cookieParser = require(`cookie-parser`);
const bodyParser = require(`body-parser`);
const Cors = require(`cors`);

//Setting up mongoose
const mongoose = require(`mongoose`);

app.use(Cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

let MONGODB_URI = ``;

// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === `production`) {
  app.use(express.static(`../client/build`));
  MONGODB_URI = process.env.MONGO_ATLUS
} else {
  MONGODB_URI = `mongodb://localhost/fantasyEliminator`;
};

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

require(`./routes/rosterRoutes`)(app);
require(`./routes/mySportsRoutes`)(app);
require(`./routes/groupRoutes`)(app);
require(`./routes/userRoutes`)(app);

// Send every other request to the React app
// Define any API routes before this runs
app.get(`*`, (req, res) => {
  res.sendFile(path.join(__dirname, `../client/build/index.html`));
});

app.listen(PORT, () => {
  console.log(`🌎 ==> API server now on port ${PORT}!`);
});