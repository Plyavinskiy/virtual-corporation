const dimensions = { width: 1100, height: 500 };

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dimensions.width + 100)
  .attr("height", dimensions.height + 100);

const graph = svg.append("g").attr("transform", "translate(50, 50)");

const stratify = d3
  .stratify()
  .id((d) => d.name)
  .parentId((d) => d.parent);

const tree = d3.tree().size([dimensions.width, dimensions.height]);

const color = d3.scaleOrdinal(["#f4511e", "#e91e63", "#e53935", "#9c27b0"]);

const update = (data) => {
  graph.selectAll(".node").remove();
  graph.selectAll(".link").remove();

  color.domain(data.map((item) => item.department));

  const rootNode = stratify(data);
  const treeData = tree(rootNode);
  const nodes = graph.selectAll(".node").data(treeData.descendants());

  const links = graph.selectAll(".link").data(treeData.links());

  links
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "#aaa")
    .attr("stroke-width", 2)
    .attr(
      "d",
      d3
        .linkVertical()
        .x((d) => d.x)
        .y((d) => d.y)
    );

  const enterNodes = nodes
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

  enterNodes
    .append("rect")
    .attr("fill", (d) => color(d.data.department))
    .attr("stroke", "#555")
    .attr("stroke-width", 2)
    .attr("width", (d) => d.data.name.length * 20)
    .attr("transform", (d) => {
      const x = d.data.name.length * 10;
      return `translate(${-x}, -25)`;
    })
    .attr("height", 37);

  enterNodes
    .append("text")
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .text((d) => d.data.name);
};

let data = [];

db.collection("employees").onSnapshot((snapshot) => {
  snapshot.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case "added":
        data = [...data, doc];
        break;
      case "modified":
        data = data.map((item) => (item.id === doc.id ? doc : item));
        break;
      case "removed":
        data = data.filter((item) => item.id !== doc.id);
        break;
      default:
        break;
    }
  });

  update(data);
});
