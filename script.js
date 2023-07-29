// Constants
const width = 800;
const height = 500;

// Create the SVG element
const svg = d3.select("#map")
  .attr("width", width)
  .attr("height", height);

// Projection and path
const projection = d3.geoNaturalEarth1().scale(150).translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// Load the world map data
d3.json("https://raw.githubusercontent.com/topojson/world-atlas/master/world/50m.json").then((worldData) => {
  const countries = topojson.feature(worldData, worldData.objects.countries);

  // Load the population data
  d3.json("data.json").then((data) => {
    // Merge population data with geometries
    countries.features.forEach((country) => {
      const continent = country.properties.continent;
      const countryData = data[continent].find((d) => d.country === country.properties.name);
      if (countryData) {
        country.properties.population = countryData.population;
      }
    });

    // Color scale
    const maxPopulation = d3.max(countries.features, (d) => d.properties.population);
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxPopulation]);

    // Draw the map
    svg.selectAll("path")
      .data(countries.features)
      .enter().append("path")
      .attr("d", path)
      .style("fill", (d) => colorScale(d.properties.population))
      .style("stroke", "#fff")
      .style("stroke-width", "0.5px");

    // Add annotations
    const annotations = [
      {
        note: { label: "China has the highest population in Asia." },
        subject: { id: "China", type: "country" },
        connector: { type: "elbow" },
        x: 400,
        y: 100,
        dy: -100,
        dx: 100
      },
      {
        note: { label: "United States has the highest population in North America." },
        subject: { id: "United States", type: "country" },
        connector: { type: "elbow" },
        x: 300,
        y: 200,
        dy: 100,
        dx: 200
      },
      {
        note: { label: "Germany has the highest population in Europe." },
        subject: { id: "Germany", type: "country" },
        connector: { type: "elbow" },
        x: 250,
        y: 250,
        dy: -50,
        dx: 50
      }
    ];

    const makeAnnotations = d3.annotation().annotations(annotations);
    svg.append("g").call(makeAnnotations);
  });
});
