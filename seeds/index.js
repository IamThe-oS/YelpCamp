const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const fetch = require("node-fetch");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

// const getGeometry = async function(location) {
//   const response = await fetch(`https://nominatim.openstreetmap.org/search?format=geojson&q=${location}`)
//   const data = await response.json();
//   const geometry = data.features[0].geometry
//   console.log(geometry)
//   return geometry;
// }

const seedDB = async () => {
  await Campground.deleteMany({});
  // const camp = new Campground({ title: 'Camp1', description: 'This is the first camp'});
  // await camp.save();

  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);

    const location = `${cities[random1000].city}, ${cities[random1000].state}`;
    // const geometry = getGeometry(location)
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "62cac8dce1ff90d0a3fa157a",
      location: location,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dh8h4jvnr/image/upload/v1658308352/YelpCamp/vzenaorl4bwxnxtofqbi.jpg",
          filename: "YelpCamp/vzenaorl4bwxnxtofqbi",
        },
        {
          url: "https://res.cloudinary.com/dh8h4jvnr/image/upload/v1658308354/YelpCamp/yry3yypovcyqwerptl5b.jpg",
          filename: "YelpCamp/yry3yypovcyqwerptl5b",
        },
        {
          url: "https://res.cloudinary.com/dh8h4jvnr/image/upload/v1658308357/YelpCamp/o9ublfti9hyzdskcxr8q.jpg",
          filename: "YelpCamp/o9ublfti9hyzdskcxr8q",
        },
        {
          url: "https://res.cloudinary.com/dh8h4jvnr/image/upload/v1658308358/YelpCamp/nfrhnozjikwnur3igqw2.jpg",
          filename: "YelpCamp/nfrhnozjikwnur3igqw2",
        },
        {
          url: "https://res.cloudinary.com/dh8h4jvnr/image/upload/v1658308392/YelpCamp/ycytlyykfuqmmrevawpt.jpg",
          filename: "YelpCamp/ycytlyykfuqmmrevawpt",
        },
        {
          url: "https://res.cloudinary.com/dh8h4jvnr/image/upload/v1658308387/YelpCamp/d69c4f4ne0tw7d3umko2.jpg",
          filename: "YelpCamp/d69c4f4ne0tw7d3umko2",
        },
        {
          url: "https://res.cloudinary.com/dh8h4jvnr/image/upload/v1658308389/YelpCamp/densaj9oyvragh7pdbc0.jpg",
          filename: "YelpCamp/densaj9oyvragh7pdbc0",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eligendi adipisci quae est et, ducimus impedit blanditiis sed deleniti provident nisi illum doloribus magni hic rerum. Quis ullam est veritatis? Eligendi?",
      price,
    });
    // console.log(camp)
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
