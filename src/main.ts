import './style.css'

import { h } from "./dom";
import { loadData } from './data';
import { Table, aggregator } from "../lib/main";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="container">
  </div>
`

loadData().then(data => {
  const table = new Table({
    columns: [
      { name: "day", text: "Day" },
      { name: "time", text: "Time" },
    ],
    rows: [
      { name: "sex", text: "Gender" },
      { name: "smoker", text: "Smoke?" },
    ],
    data,
    aggregator: aggregator.sum("tip"),
    // aggregator: aggregator.count(),
    // aggregator: aggregator.max("tip"),
    // aggregator: aggregator.min("tip"),
    // aggregator: aggregator.avg("tip"),
    formatter: (val: number) => val.toFixed(2),
    colTotal: true,
    rowTotal: true,
    // colTotalText: "SumC",
    // rowTotalText: "SumR",
  });

  const el = table.render(h);

  document.querySelector("#container")?.appendChild(el);
});

