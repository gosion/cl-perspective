import { count } from "./aggregator";

type Descriptor = {
  name: string;
  text: string;
}

type DataFrame = {
  columns: string[];
  rows: any[][];
}

interface Aggregator {
  (props: string[]): (data: any[], rowKeys?: any[], colKeys?: any[]) => any;
}

interface Formatter {
  (val: any): any;
}

type TableOpts = {
  data: DataFrame;
  columns: Descriptor[];
  rows: Descriptor[];
  aggregator?: Aggregator;
  formatter?: Formatter;
  rowTotal?: boolean;
  colTotal?: boolean;
  rowTotalText?: string;
  colTotalText?: string;
}

interface h {
  (tag: string, props?: Record<string, any>, children?: Array<string | HTMLElement>): HTMLElement
}

class Table {
  data: DataFrame;
  columns: Descriptor[];
  rows: Descriptor[];
  aggregator: Aggregator;
  formatter: Formatter;
  rowTotal: boolean = false;
  colTotal: boolean = false;
  rowTotalText: string = "Totals";
  colTotalText: string = "Totals";

  /**
   *
   */
  constructor(opts: TableOpts) {
    this.data = opts.data;
    this.columns = opts.columns;
    this.rows = opts.rows;
    this.aggregator = opts.aggregator ?? count();
    this.formatter = opts.formatter ?? ((val: any) => val);
    opts.rowTotal != void 0 && (this.rowTotal = opts.rowTotal);
    opts.colTotal != void 0 && (this.colTotal = opts.colTotal);
    opts.rowTotalText != void 0 && (this.rowTotalText = opts.rowTotalText);
    opts.colTotalText != void 0 && (this.colTotalText = opts.colTotalText);
  }

  _transform() {
    const records = this.data.rows.map(
      r => r.reduce((acc, curr, ri) => {
        acc[this.data.columns[ri]] = curr;
        return acc;
      }, Object.create(null)));
    const allRowKeys: any[][] = [];
    const allColKeys: any[][] = [];
    const matrix = records.reduce((acc, curr) => {
      const rowKeys = this.rows.map(r => curr[r.name]);
      const colKeys = this.columns.map(c => curr[c.name]);
      const rKey = rowKeys.join("|");
      const cKey = colKeys.join("|");
      if (!allRowKeys.find(r => r.join("|") == rKey)) {
        allRowKeys.push(rowKeys);
      }
      if (!allColKeys.find(c => c.join("|") == cKey)) {
        allColKeys.push(colKeys);
      }
      if (!acc[rKey]) {
        acc[rKey] = Object.create(null);
      }

      const aggregator = this.aggregator([
        ...this.rows.map(r => r.name),
        ...this.columns.map(c => c.name)
      ]);

      if (!acc[rKey][cKey]) {
        acc[rKey][cKey] = {
          value: aggregator(records, rowKeys, colKeys),
          items: [curr]
        };
      } else {
        acc[rKey][cKey].items.push(curr);
      }

      return acc;
    }, Object.create(null));

    const comparer = (a: any[], b: any[]) => {
      const strA = a.join("|");
      const strB = b.join("|");
      return strA < strB ? -1
        : strA > strB ? 1
          : 0
    }

    allRowKeys.sort(comparer);
    allColKeys.sort(comparer);

    const calcSpan = (arr: any[][], idx: number) => {
      return arr.reduce((acc, curr, i) => {
        const key = curr.slice(0, idx + 1).join("|");
        if (acc.length === 0 || acc[acc.length - 1].key !== key) {
          acc.push({
            key,
            value: curr[idx],
            count: 1,
            start: i,
          });
        } else {
          acc[acc.length - 1].count++;
        }
        return acc;
      }, []);
    }

    const rowSpans = this.rows.map((_, ri) => calcSpan(allRowKeys, ri));
    const colSpans = this.rows.map((_, ri) => calcSpan(allColKeys, ri));

    return {
      matrix,
      allRowKeys,
      allColKeys,
      rowSpans,
      colSpans,
      records,
    }
  }

  _aggrateRow(records: any[], rowKeys: any[]) {
    return this.aggregator(this.rows.map(r => r.name))(records, rowKeys);
  }

  _aggrateCol(records: any[], colKeys: any[]) {
    return this.aggregator(this.columns.map(c => c.name))(records, void 0, colKeys);
  }

  _aggrateAll(records: any[]) {
    return this.aggregator([])(records);
  }

  _renderHeader(h: h, colSpans: any[]) {
    return h("thead", [
      ...this.columns.map((c, ci) => h("tr", [
        ci === 0
          ? h(
            "th",
            {
              class: "p-table-col",
              rowspan: this.columns.length,
              colspan: this.rows.length,
            })
          : "",
        h(
          "th",
          {
            class: "p-table-col",
          },
          [c.text]),
        ...colSpans[ci].map((cs: any) => h(
          "th",
          {
            class: "p-table-col",
            rowspan: ci === this.columns.length - 1 ? 2 : void 0,
            colspan: cs.count,
          },
          [cs.value],
        )),
        this.rowTotal && ci === 0
          ? h("th", { class: "p-table-col", rowspan: this.columns.length + 1 }, [this.rowTotalText])
          : h("th")
      ])),
      h("tr", [
        ...this.rows.map(r => h("th", {
          class: "p-table-col",
        }, [r.text])),
        h("th", { class: "p-table-col" })
      ]),
    ])
  }

  _renderBody(h: h, matrix: any, allRowKeys: any[][], allColKeys: any[][], rowSpans: any[], records: any[]) {
    return h("tbody", [
      ...allRowKeys.map((rks, rki) => h("tr", [
        ...rowSpans.map((rss, rsi) => {
          const r = rss.find((rs: any) => rs.start === rki);
          return r ? h("td",
            {
              class: "p-table-row",
              colspan: rsi === rowSpans.length - 1 ? 2 : void 0,
              rowspan: r.count,
            },
            [r.value])
            : ""
        }),
        ...allColKeys.map(cks =>
          h("td",
            {
              class: "p-table-cell",
            },
            [this.formatter(matrix[rks.join("|")][cks.join("|")]?.value ?? 0)])),
        this.rowTotal
          ? h("td",
            {
              class: "p-table-cell"
            },
            [
              this.formatter(this._aggrateRow(records, rks))
            ])
          : h("td"),
      ])),
      this.colTotal ? h("tr", [
        h("td",
          {
            class: "p-table-row text-right",
            colspan: this.rows.length + 1
          }, [this.colTotalText]),
        ...allColKeys.map(cks =>
          h("td",
            {
              class: "p-table-cell"
            },
            [
              this.formatter(this._aggrateCol(records, cks))
            ])),
        this.rowTotal && this.colTotal
          ? h("td",
            { class: "p-table-cell" },
            [
              this.formatter(this._aggrateAll(records))
            ])
          : h("td"),
      ]) : h("tr")
    ])
  }

  render(h: h) {
    const { matrix, allRowKeys, allColKeys, colSpans, rowSpans, records } = this._transform();
    return h("table", { class: "p-table" }, [
      this._renderHeader(h, colSpans),
      this._renderBody(h, matrix, allRowKeys, allColKeys, rowSpans, records),
    ])
  }
}

export {
  Table
}

