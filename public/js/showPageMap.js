const key = mapTilerKey

const map = new maplibregl.Map({
    container: 'map',
    style: `https://api.maptiler.com/maps/hybrid/style.json?key=${key}`, // stylesheet location 
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

map.addControl(new maplibregl.NavigationControl());

const mmarker = new maplibregl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new maplibregl.Popup({offset: 25})
        .setHTML(`<h5>${campground.title}</h5><p>${campground.location}</p>`)
        .setMaxWidth("200px")
    )
    .addTo(map)

