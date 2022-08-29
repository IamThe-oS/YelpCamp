const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");
const fetch = require("node-fetch");

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  // if(!req.body.campground) throw new ExpressError(400, 'Invalid Campground Data')
  const location = req.body.campground.location;
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=geojson&q=${location}`
  );
  const data = await response.json();

  const campground = new Campground(req.body.campground);
  campground.geometry = data.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  // console.log(campground)
  req.flash("success", "Successfully created a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  // console.log(campground)
  if (!campground) {
    req.flash("error", "Sorry, campground not found.");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/details", { campground });
};

module.exports.updateCampground = async (req, res, next) => {
  const { id } = req.params;

  const location = req.body.campground.location;
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=geojson&q=${location}`
  );
  const data = await response.json();

  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  campground.geometry = data.features[0].geometry;
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated the campground!");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.renderEditForm = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Sorry, campground not found.");
    res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted the campground!");
  res.redirect("/campgrounds");
};
