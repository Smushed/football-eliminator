require(`dotenv`).config();

const express = require(`express`);
const path = require(`path`);
const PORT = process.env.PORT || 8081;
const app = express();

const cookieParser = require(`cookie-parser`);
const bodyParser = require(`body-parser`);
const Cors = require(`cors`);

//Setting up mongoose
const mongoose = require(`mongoose`);

app.use(Cors());
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(cookieParser());

let MONGODB_URI = ``;

if (process.env.NODE_ENV === `production`) {
  app.use(express.static(path.join(__dirname, `./client/build`)));
  MONGODB_URI = process.env.MONGO_ATLUS;
} else {
  MONGODB_URI = `mongodb://localhost/fantasyEliminator`;
}
try {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
} catch (err) {
  console.log(err);
}

require(`./routes/rosterRoutes`)(app);
require(`./routes/mySportsRoutes`)(app);
require(`./routes/groupRoutes`)(app);
require(`./routes/userRoutes`)(app);
if (process.env.CRON_ENABLED === `true`) {
  require(`./handlers/cronHandler`);
}

// Send every other request to the React app
// Define any API routes before this runs
app.get(`*`, (req, res) => {
  res.sendFile(path.join(__dirname, `./client/build/index.html`));
});

app.listen(PORT, () => {
  console.log(`API server now on port ${PORT}!`);
});
