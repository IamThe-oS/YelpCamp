if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const ExpressError = require('./utilities/ExpressError')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')

const MongoStore = require('connect-mongo');

//Routes File
const userRoutes = require('./routes/user')
const campgroundsRoutes = require("./routes/campgrounds");
const reviewsRoutes = require("./routes/reviews");

// const dbUrl = process.env.DB_URL
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp"
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false}))

const sessionConfig = {
  store: MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600,
    dbName: 'yelp-camp'
  }),
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    name: 'ses',
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 14,
    maxAge: 1000 * 60 * 60 * 24 * 14,
  },
  
};
app.use(session(sessionConfig));
app.use(flash())

//Passport (Auth)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Middleware
app.use((req, res, next) => {
  // console.log(req.query)
  res.locals.returnTo = req.session.returnTo;
  res.locals.signedInUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next()
})

//Set Routes
app.use('/', userRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);

// Routers
app.get('/fakeUser', async(req, res) => {
  const user = new User({
    email: 'theo@gmail.com',
    username: 'theo'
  });
  const newUser = await User.register(user, 'theo');
  res.send(newUser);
});

app.get("/", (req, res) => {
  res.render("home");
});

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

//Error
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) message = "Something went wrong.";
  res.status(statusCode).render("error", { err });
});

//Port
const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(`Open on port ${port}`);
});

// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.mapbox.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//   helmet.contentSecurityPolicy({
//       directives: {
//           defaultSrc: [],
//           connectSrc: ["'self'", ...connectSrcUrls],
//           scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//           styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//           workerSrc: ["'self'", "blob:"],
//           objectSrc: [],
//           imgSrc: [
//               "'self'",
//               "blob:",
//               "data:",
//               "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
//               "https://images.unsplash.com/",
//           ],
//           fontSrc: ["'self'", ...fontSrcUrls],
//       },
//   })
// );