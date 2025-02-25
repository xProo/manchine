class D3Visualizer {
  constructor() {
    console.log("Initialisation D3Visualizer");

    this.margin = { top: 20, right: 20, bottom: 30, left: 40 };
    this.width = 800 - this.margin.left - this.margin.right;
    this.height = 300 - this.margin.top - this.margin.bottom;

    this.setupSVG();
    this.setupScales();
    this.setupAxes();
  }

  setupSVG() {
    // Supprimer l'ancien SVG s'il existe
    d3.select("#d3-container svg").remove();

    this.svg = d3
      .select("#d3-container")
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    console.log("SVG créé");
  }

  setupScales() {
    this.x = d3.scaleLinear().domain([0, 1024]).range([0, this.width]);

    this.y = d3.scaleLinear().domain([0, 255]).range([this.height, 0]);
  }

  setupAxes() {
    this.xAxis = this.svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${this.height})`);

    this.yAxis = this.svg.append("g").attr("class", "axis");
  }

  update(audioData) {
    // Log pour debug
    console.log("Mise à jour avec données:", audioData.length);

    // Sélectionner ou créer les barres
    const bars = this.svg.selectAll("rect").data(audioData);

    // Entrer
    bars
      .enter()
      .append("rect")
      .merge(bars)
      .attr("x", (d, i) => this.x(i))
      .attr("y", (d) => this.y(d))
      .attr("width", this.width / audioData.length)
      .attr("height", (d) => this.height - this.y(d))
      .attr("fill", (d) => `rgb(${d}, 50, 50)`);

    // Sortir
    bars.exit().remove();
  }

  addFrequencyAnalysis() {
    // Ajout d'une ligne de référence pour les fréquences importantes
    this.svg
      .append("line")
      .attr("class", "threshold-line")
      .attr("x1", 0)
      .attr("x2", this.width)
      .attr("y1", this.y(0.5))
      .attr("y2", this.y(0.5))
      .style("stroke", "red")
      .style("stroke-dasharray", "5,5");

    // Ajout d'annotations pour les plages de fréquences
    this.addFrequencyAnnotation("Basses", 0, 200);
    this.addFrequencyAnnotation("Médiums", 200, 2000);
    this.addFrequencyAnnotation("Aigus", 2000, 20000);
  }

  addFrequencyAnnotation(label, start, end) {
    const xStart = this.x(start);
    const xEnd = this.x(end);

    this.svg
      .append("text")
      .attr("class", "frequency-label")
      .attr("x", (xStart + xEnd) / 2)
      .attr("y", this.height + 25)
      .text(label);
  }
}
