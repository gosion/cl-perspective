export async function loadData() {
  console.info("loading data...");
  const resp = await fetch("https://raw.githubusercontent.com/nicolaskruchten/Rdatasets/master/csv/reshape2/tips.csv");
  console.info("data loaded");
  const csv = await resp.text();
  const [cols, ...rows] = csv.replace(/\"/g, "").split("\n");
  rows.splice(rows.length - 1, 1);
  return {
    columns: cols.split(",").map(c => c || "#"),
    rows: rows.map(r => r.split(",").map(x => {
      const y = parseFloat(x);
      return isNaN(y) ? x : y;
    }))
  }
}

