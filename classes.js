class Camera {
  x;
  y;
  scale = 1;

  constructor(x = 0, y = 0, scale = 1) {
    this.x = x;
    this.y = y;
    this.scale = scale;
  }

  worldToScreenP(point) {
    return new Point((point.x - this.x) * this.scale, (point.y - this.y) * this.scale);
  }

  worldToScreenA(area) {
    return new Area((area.x - this.x) * this.scale, (area.y - this.y) * this.scale, area.wid * this.scale, area.hei * this.scale);
  }

  ScreenToWorldP(point) {
    return new Point(point.x / this.scale + this.x, point.y / this.scale + this.y);
  }

  ScreenToWorldA(area) {
    return new Area(area.x / this.scale + this.x, area.y / this.scale + this.y, this.wid / camera.scale, this.hei / camera.scale);
  }
}

class Point {
  x;
  y;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  isIntersectP(point) {
    // TODO
  }

  isIntersectA(area) {
    return this.x >= area.x && this.x <= area.x + area.wid && this.y >= area.y && this.y <= area.y + area.hei;
  }
}

class Area {
  x;
  y;
  wid;
  hei;

  constructor(x, y, wid, hei) {
    this.x = x;
    this.y = y;
    this.wid = wid;
    this.hei = hei;
  }

  isIntersectP(point) {
    return point.x >= this.x && point.x <= this.x + this.wid && point.y >= this.y && point.y <= this.y + this.hei;
  }

  isIntersectA(area) {
    return area.x + area.wid > this.x && area.x < this.x + this.wid && area.y + area.hei > this.y && area.y < this.y + this.hei;
  }
}

class Click extends Point {
  button;
  modifiers;

  constructor(x, y, button, modifiers) {
    super(x, y);
    this.button = button;
    this.modifiers = modifiers;
  }

  transformByCam(cam) {
    let transformed = cam.ScreenToWorldP(this);
    this.x = transformed.x;
    this.y = transformed.y;
  }
}

class Drag extends Click {
  offX;
  offY;

  constructor(x, y, offX, offY, button, modifiers) {
    super(x, y, button, modifiers);
    this.offX = offX;
    this.offY = offY;
  }

  transformByCam(cam) {
    super.transformByCam(cam);
    this.offX = this.offX / cam.scale;
    this.offY = this.offY / cam.scale;
  }
}

class Box extends Area {
  type;

  constructor(x, y, wid, hei, type = 0) {
    super(x, y, wid, hei);
    this.type = type;
  }

}

class BoundingBox extends Area {
  active = false;
  boxes = new LinkedList();

  constructor(x, y, wid, hei, active = false) {
    super(x, y, wid, hei);
    this.active = active;
  }

  setBounds(boxes) {
    this.boxes = boxes;
    if (boxes.length > 0) {
      this.active = true;

      this.x = boxes.first.value.x;
      this.y = boxes.first.value.y;
      this.wid = boxes.first.value.wid;
      this.hei = boxes.first.value.hei;

      for (let box of boxes) {
        if (box.x < this.x) {
          this.wid += this.x - box.x;
          this.x = box.x;
        }
        if (box.y < this.y) {
          this.hei += this.y - box.y;
          this.y = box.y;
        }
        if (box.x + box.wid > this.x + this.wid) this.wid += box.x + box.wid - (this.x + this.wid);
        if (box.y + box.hei > this.y + this.hei) this.hei += box.y + box.hei - (this.y + this.hei);
      }
    } else {
      this.active = false;
    }
  }
}

class SelectionBox extends Area {
  active = false;

  constructor(x, y, wid, hei, active = false) {
    super(x, y, wid, hei);
    this.active = active;
  }

  init(click) {
    this.x = click.x;
    this.y = click.y;
    this.wid = 0;
    this.hei = 0;

    this.active = true;
  }

  scaleTo(click) {
    this.wid = click.x - this.x;
    this.hei = click.y - this.y;
  }
  
  makePositive() {
    this.x += Math.min(0, this.wid);
    this.y += Math.min(0, this.hei);
    this.wid = Math.abs(this.wid);
    this.hei = Math.abs(this.hei);
  }
  
  getArea() {
    return new Area(this.x + Math.min(0, this.wid), this.y + Math.min(0, this.hei), Math.abs(this.wid), Math.abs(this.hei));
  }

  getInBounds(scene) {
    let bounds = new Area(this.x + Math.min(0, this.wid), this.y + Math.min(0, this.hei), Math.abs(this.wid), Math.abs(this.hei));
    let out = [];
    for (let elem of scene) {
      if (bounds.isIntersectA(elem)) {
        out.push(elem);
      }
    }
    return out;
  }

  addInBoundsToSelectionList(scene, selectionList) {
    let bounds = new Area(this.x + Math.min(0, this.wid), this.y + Math.min(0, this.hei), Math.abs(this.wid), Math.abs(this.hei));
    for (let elem of scene) {
      if (bounds.isIntersectA(elem)) {
        selectionList.addElem(scene, elem);
      }
    }
  }
}

class LLNode {
  next = null;
  previous = null;
  value = null;
  parent = null;

  constructor(value) {
    this.value = value;
  }

  insertBefore(node) {
    if (this.parent) this.parent.length--;
    this.parent = node.parent;
    this.previous = node.previous;
    this.next = node;
    node.previous = this;
    if (this.previous) {
      this.previous.next = this;
    }
    if (this.parent) this.parent.length++;
  }

  insertAfter(node) {
    if (this.parent) this.parent.length--;
    this.parent = node.parent;
    this.next = node.next;
    this.previous = node;
    node.next = this;
    if (this.next) {
      this.next.previous = this;
    }
    if (this.parent) this.parent.length++;
  }

  // append to beginning of linkedList
  appendB(parent) {
    if (this.parent) this.parent.length--;
    this.parent = parent;
    this.next = this.parent.first;
    this.parent.first = this;
    if (this.next) {
      this.next.previous = this;
    } else {
      this.parent.last = this;
    }
    if (this.parent) this.parent.length++;
  }

  // append to end of linkedList
  appendE(parent) {
    if (this.parent) this.parent.length--;
    this.parent = parent;
    this.previous = this.parent.last;
    this.parent.last = this;
    if (this.previous) {
      this.previous.next = this;
    } else {
      this.parent.first = this;
    }
    if (this.parent) this.parent.length++;
  }

  splice() {
    if (this.parent) this.parent.length--;
    if (this.next) {
      this.next.previous = this.previous;
    } else {
      this.parent.last = this.last; 
    }
    if (this.previous) {
      this.previous.next = this.next;
    } else {
      this.parent.first = this.next;
    }
    this.previous = null;
    this.next = null;
    this.parent = null;
  }
}

class LinkedList {
  first = null;
  last = null;
  length = 0;

  constructor(vals) {
    this.first = null;
    this.last = null;
    this.length = 0;

    if (vals != undefined) {
      this.appendM(vals);
    }
  }

  prepend(elem) {
    new LLNode(elem).appendB(this);
  }

  append(elem) {
    new LLNode(elem).appendE(this);
  }
  
  appendM(list) {
    for (let elem of list) {
      this.append(elem);
    }
  }

  listAll() {
    let node = this.first;
    while (node != null) {
      console.log(node.value);
      node = node.next;
    }
  }
  
  getAll(exp, giveNodes = false) {
    let out = new LinkedList();
    let node = this.first;
    while (node != null) {
      if (exp(node.value)) {
        if (giveNodes) {
          out.append(node);
        } else {
          out.append(node.value);
        }
      }
      node = node.next;
    }
    return out;
  }
  
  appendIfNew(elem) {
    for (let val of this) {
      if (val == elem) {
        return false;
      }
    }
    this.append(elem);
    return true;
  }

  appendIfNewM(list) {
    for (let elem of list) {
      this.appendIfNew(elem);
    }
  }
  
  clearAll() {
    let node = this.first;
    while (node != null) {
      let next = node.next;
      node.next = null;
      node.previous = null;
      node = next;
    }
    this.first = null;
    this.last = null;
  }

  includes(elem) {
    for (let val of this) {
      if (val == elem) {
        return true;
      }
    }
    return false;
  }

  [Symbol.iterator]() {
    let current = this.first;
    return {
      next() {
        if (current == null) {
          return {done: true};
        }
        let out = current.value;
        current = current.next;
        return {value: out, done: false};
      }
    }
  }
  
  reverseIterate(exp) {
    let node = this.last;
    while (node != null) {
      let val = exp(node.value);
      if (val !== undefined ) {
        return val;
      }
      node = node.previous;
    }
  }
}

class SelectionList {
  elems;
  indeces;

  constructor() {
    this.elems = [];
    this.indeces = [];
  }

  clear() {
    this.elems = [];
    this.indeces = [];
  }

  addElem(elems, index) {
    this.elems.push(elems[index]);
    this.indeces.push(index);
  }
}
