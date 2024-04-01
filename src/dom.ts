function classNames(obj: Record<string, boolean>) {
  return Object.keys(obj).filter(k => obj[k]).join(" ");
}

function h(tag: string): HTMLElement;
function h(tag: string, props: Record<string, any>): HTMLElement;
function h(tag: string, children: Array<string | HTMLElement>): HTMLElement;
function h(tag: string, props: Record<string, any>, children: Array<string | HTMLElement>): HTMLElement;
function h(tag: string, props?: Record<string, any>, children?: Array<string | HTMLElement>): HTMLElement {
  const el = document.createElement(tag);

  if (arguments.length == 2 && Array.isArray(arguments[1])) {
    props = void 0;
    children = arguments[1];
  }

  if (props) {
    for (let p in props) {
      if (p === "class" && typeof props[p] === "object") {
        el.className = classNames(props[p]);
      } else {
        el.setAttribute(p, props[p]);
      }
    }
  }

  const fragment = document.createDocumentFragment();
  if (children) {
    if (!Array.isArray(children)) children = children = [children];

    for (let c of children) {
      if (c instanceof HTMLElement) {
        fragment.appendChild(c);
      } else {
        fragment.textContent += c;
      }
    }
  }
  el.appendChild(fragment);
  return el;
}

export {
  h
}

