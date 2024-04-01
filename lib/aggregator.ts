function filter(data: any[], props: string[], rowKeys?: any[], colKeys?: any[]) {
  const keys = [...rowKeys ?? [], ...colKeys ?? []];
  return data.filter(x => props.every((p, pi) =>
    x[p] === keys[pi]
  ));
}

export function count() {
  return (props: string[]) => (data: any[], rowKeys?: any[], colKeys?: any[]) => {
    return filter(data, props, rowKeys, colKeys).length;
  }
}

export function sum(key: string) {
  return (props: string[]) => (data: any[], rowKeys?: any[], colKeys?: any[]) => {
    return filter(data, props, rowKeys, colKeys).reduce((acc, curr) => {
      acc += parseFloat(curr[key]);
      return acc;
    }, 0);
  }
}

export function avg(key: string) {
  return (props: string[]) => (data: any[], rowKeys?: any[], colKeys?: any[]) => {
    const filtered = filter(data, props, rowKeys, colKeys);
    const sum = filtered.reduce((acc, curr) => {
      acc += parseFloat(curr[key]);
      return acc;
    }, 0);
    return sum / filtered.length;
  }
}

export function max(key: string) {
  return (props: string[]) => (data: any[], rowKeys?: any[], colKeys?: any[]) => {
    return filter(data, props, rowKeys, colKeys).reduce((acc, curr) => {
      if (acc == void 0) return curr[key];
      else if (curr[key] == void 0) return acc;
      else return acc < curr[key] ? curr[key] : acc;
    }, void 0);
  }
}

export function min(key: string) {
  return (props: string[]) => (data: any[], rowKeys?: any[], colKeys?: any[]) => {
    return filter(data, props, rowKeys, colKeys).reduce((acc, curr) => {
      if (acc == void 0) return curr[key];
      else if (curr[key] == void 0) return acc;
      else return acc > curr[key] ? curr[key] : acc;
    }, void 0);
  }
}
