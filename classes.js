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

  screenToWorldP(point) {
    return new Point(point.x / this.scale + this.x, point.y / this.scale + this.y);
  }

  screenToWorldA(area) {
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

  scaleTo(point) {
    this.wid = point.x - this.x;
    this.hei = point.y - this.y;
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
    let transformed = cam.screenToWorldP(this);
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
  offX;
  offY;
  offW;
  offH;

  snap(clearOff = true) {
    let newX = Math.round(this.x + this.offX + Math.min(this.wid + this.offW, 0));
    let newY = Math.round(this.y + this.offY + Math.min(this.hei + this.offH, 0));
    let newW = Math.round(Math.abs(this.wid + this.offW));
    let newH = Math.round(Math.abs(this.hei + this.offH));
    if (clearOff) {
      this.offX = 0;
      this.offY = 0;
      this.offW = 0;
      this.offH = 0;
    } else {
      this.offX -= newX - this.x;
      this.offY -= newY - this.y;
      this.offW -= newW - this.wid;
      this.offH -= newH - this.hei;
    }
    this.x = newX;
    this.y = newY;
    this.wid = newW;
    this.hei = newH;
  }

  constructor(x, y, wid, hei, type = 0) {
    super(x, y, wid, hei);
    this.offX = 0;
    this.offY = 0;
    this.offW = 0;
    this.offH = 0;
    this.type = type;
  }

  getTransformedArea() {
    return new Area(this.x + this.offX, this.y + this.offY, this.wid + this.offW, this.hei + this.offH);
  }

  draw(can2d, cam, highlight = 0, drawUntransformed = true) {
    if (drawUntransformed) {
      let untransformed = cam.worldToScreenA(this);
      can2d.fillStyle = "black"; // TODO, get color
      can2d.globalAlpha = 0.25;
      can2d.fillRect(untransformed.x, untransformed.y, untransformed.wid, untransformed.hei);
      can2d.globalAlpha = 1;
    }
    let transformed = cam.worldToScreenA(this.getTransformedArea());
    can2d.fillStyle = "black"; // TODO, get color
    can2d.fillRect(transformed.x, transformed.y, transformed.wid, transformed.hei);
    if (highlight > 0) {
      can2d.fillStyle = "white";
      can2d.globalAlpha = 0.25 * highlight;
      can2d.fillRect(transformed.x, transformed.y, transformed.wid, transformed.hei);
      can2d.globalAlpha = 1;
    }
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

      let firstTBox = boxes.first.value.getTransformedArea();

      this.x = firstTBox.x;
      this.y = firstTBox.y;
      this.wid = firstTBox.wid;
      this.hei = firstTBox.hei;

      for (let box of boxes) {
        let tBox = box.getTransformedArea();
        if (tBox.x < this.x) {
          this.wid += this.x - tBox.x;
          this.x = tBox.x;
        }
        if (tBox.y < this.y) {
          this.hei += this.y - tBox.y;
          this.y = tBox.y;
        }
        if (tBox.x + tBox.wid > this.x + this.wid) this.wid += tBox.x + tBox.wid - (this.x + this.wid);
        if (tBox.y + tBox.hei > this.y + this.hei) this.hei += tBox.y + tBox.hei - (this.y + this.hei);
      }
    } else {
      this.active = false;
    }
  }

  isIntersectP(point) {
    if (!this.active) return false;
    return super.isIntersectP(point);
  }

  isIntersectA(area) {
    if (!this.active) return false;
    return super.isIntersectA(point);
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

  isIntersectP(point) {
    if (!this.active) return false;
    return super.isIntersectP(point);
  }
  
  isIntersectA(area) {
    if (!this.active) return false;
    return super.isIntersectA(area);
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
      this.parent.last = this.previous; 
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
    let i = 0;
    while (node != null) {
      console.log(node.value);
      node = node.next;
      i++;
    }
    return i;
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
  
  appendIfNew(elem) {// TODO: rewrite
    /* for (let val of this) {
      if (val == elem) {
        return false;
      }
    } */
    if (this.contains(elem)) return false;
    this.append(elem);
    return true;
  }

  appendIfNewM(list) {
    for (let elem of list) {
      this.appendIfNew(elem);
    }
  }
  
  contains(elem) {
    for (let val of this) {
      if (val == elem) {
        return true;
      }
    }
    return false;
  }
  
  containsAll(list) {
    for (let elem of list) {
      if (!this.contains(elem)) return false;
    }
    return true;
  }
  
  appendToggle(elem) {
    /*
    let node = this.first;
    while (node != null) {
      if (node.value == elem) {
        node.splice();
        return;
      } else {
        node = node.next;
      }
    } //*/
    if (!this.remove(elem))
      this.append(elem);
  }
  
  remove(elem) {
    let node = this.first;
    while (node != null) {
      if (node.value == elem) {
        node.splice();
        return true;
      } else {
        node = node.next;
      }
    }
    return false;
  }
  
  removeM(list) {
    for (let elem of list) {
      this.remove(elem);
    }
  }
  
  clearAll() {
    let node = this.first;
    while (node != null) {
      let next = node.next;
      node.next = null;
      node.previous = null;
      this.length -= 1;
      node = next;
    }
    this.first = null;
    this.last = null;
    if (this.length != 0) console.error("something may have gone wrong");
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

/* class SelectionList {
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
} */

class UIManager {
  elems;

  constructor() {
    this.elems = [];
  }

  addElem(elem) {
    this.elems.push(elem);
  }

  checkForClick(click) {
    for (let elem of this.elems) {
      if (elem.isClicked(click)) {
        return true;
      }
    }
    return false;
  }
  
  checkForDrag(drag) {
    let out = false;
    for (let elem of this.elems) {
      if (elem.isDragged(drag)) {
        out = true;
      }
    }
    return out;
  }
  
  draw(can2d) {
    for (let elem of this.elems) {
      elem.draw(can2d);
    }
  }
}

class UIElem extends Area {
  color;
  
  isClicked(click) {
    return this.isIntersectP(click);
  }
  
  isDragged(drag) {
    return this.isIntersectP(drag);
  }
  
  draw(can2d) {
    can2d.fillStyle = this.color;
    can2d.fillRect(this.x, this.y, this.wid, this.hei);
  }
  
  tick(delta) {
    // Abstract
  }
  
  constructor(x, y, wid, hei, color = "white") {
    super(x, y, wid, hei);
    this.color = color;
  }
}

class Toolbar extends UIElem {
  elems = ["select", "move", "scale", "make"]; // , "delete"
  selected = 0;
  
  getClickedSegment(click) {
    let clickBox = new Area(this.x, this.y, this.wid, this.hei);
    for (let i in this.elems) {
      clickBox.wid = can2d.measureText(this.elems[i]).width + 10;
      if (clickBox.isIntersectP(click)) {
        return i;
      }
      clickBox.x += clickBox.wid;
    }
    return -1;
  }
  
  isClicked(click) {
    // see which elem is clicked
    if (!super.isClicked(click)) return false;
    this.selected = this.getClickedSegment(click);
    //TODO make change when value is changes otherwise
    mainMode = this.selected; //TODO map arrays
    return true;
  }
  
  constructor(x, y, wid, hei, color = "white") {
    super(x, y, wid, hei, color);
  }
  
  setWidth() {
    can2d.font = "16px Courier New";
    can2d.textAlign = "left";
    can2d.textBaseline = "middle";
    let width = 0;
    for (let i = 0; i < this.elems.length; i++) {
      width += can2d.measureText(this.elems[i]).width + 10;
    }
    this.wid = width;
  }
  
  draw(can2d) {
    super.draw(can2d);
    this.setWidth();
    // draw background box
    let bgBox = new Area(this.x, this.y, 0, this.hei);
    for (let i = 0; i <= this.selected; i++) {
      bgBox.x += bgBox.wid;
      bgBox.wid = can2d.measureText(this.elems[i]).width + 10;
    }
    can2d.fillStyle = "lightGray";
    can2d.fillRect(bgBox.x, bgBox.y, bgBox.wid, bgBox.hei);
    //can2d.strokeRect(bgBox.x, bgBox.y, bgBox.wid, bgBox.hei);
    // draw text
    can2d.fillStyle = "black";
    can2d.font = "16px Courier New";
    can2d.textAlign = "left";
    can2d.textBaseline = "middle";
    let added = 5;
    for (let i = 0; i < this.elems.length; i++) {
      can2d.fillText(this.elems[i], this.x + added, this.y + this.hei / 2);
      added += can2d.measureText(this.elems[i]).width + 10;
    }
  }
}