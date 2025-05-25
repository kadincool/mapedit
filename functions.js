// select
function startSelection(click) {
  if (checkBitfield(click.modifiers, 0) || !(boundingBox.active && boundingBox.isIntersectP(click)) || !selected.containsAll(hover)) { // not in bounding box
    // selectionBox.init(click);
    actionMode = 0;
  } else {
    actionMode = 1;
  }
}

function dragSelection(drag) {
  if (!selectionBox.active) {
    if (pointDist(startClick, drag, cam) >= 10) {
      selectionBox.init(startClick);
    }
  }
  selectionBox.scaleTo(drag);
  highlightHovered(drag);
}

function releaseSelection(click) {
  if (!checkBitfield(click.modifiers, 0)) selected.clearAll();
  if (selectionBox.active) {
    // select whole box
    let selectionArea = selectionBox.getArea();
    let selectionAdd = elems.getAll((e) => {return selectionArea.isIntersectA(e)})
    if (selected.containsAll(selectionAdd)) {
      selected.removeM(selectionAdd);
    } else {
      selected.appendIfNewM(selectionAdd);
    }
    selectionBox.active = false;
  } else {
    let topMost = elems.reverseIterate((elem) => {
      if (click.isIntersectA(elem)) return elem;
    });
    if (topMost) selected.appendToggle(topMost);
  }
  boundingBox.setBounds(selected);
  if (selected.length == 1) {
    currentColor = selected.first.value.type;
  }
}

// move
function startMove(click) {
  if (!boundingBox.active || !boundingBox.isIntersectP(click)) {
    // get topmost
    startSelection(click);
    releaseSelection(click);
  }
  actionMode = 1;
}

function dragMove(drag) {
  for (let elem of selected) {
    elem.offX += drag.offX;
    elem.offY += drag.offY;
    elem.snap(false);
  }
  // boundingBox.x += drag.offX;
  // boundingBox.y += drag.offY;
  boundingBox.setBounds(selected);
}

function releaseMove(click) {
  for (let elem of selected) {
    elem.snap();
  }
  boundingBox.setBounds(selected);
}

function startScale(click) {
  if (!boundingBox.active || !boundingBox.isIntersectP(click)) {
    // get topmost
    startSelection(click);
    releaseSelection(click);
  }
  actionMode = 2;
}

function dragScale(drag) {
  for (let elem of selected) {
    elem.offW += drag.offX;
    elem.offH += drag.offY;
    elem.snap(false);
  }
  boundingBox.setBounds(selected);
}

function releaseScale(click) {
  for (let elem of selected) {
    elem.snap();
  }
  boundingBox.setBounds(selected);
  deleteTiny();
}

function startAdd(click) {
  actionMode = 3;
  // make a box and make it selected
  let box = new Box(Math.round(click.x), Math.round(click.y), 0, 0, currentColor);
  elems.append(box);
  selected.clearAll();
  selected.append(box);
  // perform move action
  // dragAdd(click);
  selected.first.value.scaleTo(click);
}

function dragAdd(drag) {
  //selected.first.value.scaleTo(drag);
  //boundingBox.setBounds(selected);
  dragScale(drag);
}

function releaseAdd(click) {
  releaseScale(click);
  deleteTiny();
  //dragAdd(click);
  //selected.first.value.snap();
  //boundingBox.setBounds(selected);
}

function startDelete(click) {
  if (boundingBox.active && boundingBox.isIntersectP(click)) { // in bounding box
    deleteSelected();
    actionMode = -1;
  } else {
    selected.clearAll();
    boundingBox.active = false;
    actionMode = 4;
  }
}

function dragDelete(drag) {
  if (!selectionBox.active) {
    if (pointDist(startClick, drag, cam) >= 10) {
      selectionBox.init(startClick);
    }
  }
  selectionBox.scaleTo(drag);
  highlightHovered(drag);
}

function releaseDelete(click) {
  if (selectionBox.active) {
    let selectionArea = selectionBox.getArea();
    let selectionAdd = elems.getAll((e) => {return selectionArea.isIntersectA(e)});
    selected.appendM(selectionAdd);
    deleteSelected();
    selectionBox.active = false;
  } else {
    let topMost = elems.reverseIterate((elem) => {
      if (click.isIntersectA(elem)) return elem;
    });
    if (topMost) elems.remove(topMost);
  }
  boundingBox.active = false;
}

function deleteSelected() {
  // for (let elem of selected) {
  //   elem.wid = 0;
  //   elem.hei = 0;
  // }
  // deleteTiny();
  elems.removeM(selected);
  selected.clearAll();
  boundingBox.setBounds(selected);
}

function deleteTiny() {
  let node = elems.first;
  while (node) {
    let next = node.next; // keep track of the next one while we consider deleting this one
    let val = node.value;
    if (val.wid == 0 || val.hei == 0) {
      node.splice();
    }
    node = next;
  }

  // repeat for selected
  node = selected.first;
  while (node) {
    let next = node.next; // keep track of the next one while we consider deleting this one
    let val = node.value;
    if (val.wid == 0 || val.hei == 0) {
      node.splice();
    }
    node = next;
  }
  boundingBox.setBounds(selected);
}

function duplicateSelected() {
  let toAdd = []
  for (let elem of selected) {
    toAdd.push(new Box(elem.x + 1, elem.y + 1, elem.wid, elem.hei, elem.type));
  }
  elems.appendM(toAdd);
  selected.clearAll();
  selected.appendM(toAdd);
  boundingBox.setBounds(selected);
}

function setSelectedType(type) {
  for (let elem of selected) {
    elem.type = type;
  }
}

function selectedToBottom() {
  elems.removeM(selected);
  elems.prependM(selected);
}

function selectedToTop() {
  elems.removeM(selected);
  elems.appendM(selected);
}

function highlightHovered(drag) {
  if (selectionBox.active) {
    let selectionArea = selectionBox.getArea();
    for (let elem of elems) {
      if (selectionArea.isIntersectA(elem)) {
        hover.append(elem);
      }
    }
  } else {
    let topMost = elems.reverseIterate((elem) => {
      if (drag.isIntersectA(elem)) return elem;
    });
    if (topMost) hover.append(topMost);
  }
}

function zoom(amount, click) {
  cam.x += click.x / cam.scale;
  cam.y += click.y / cam.scale;
  if (amount > 0) while (amount > 0) {
    cam.scale = Math.min(cam.scale * 2, 128);
    amount -= 500;
  }
  else if (amount < 0) while (amount < 0) {
    cam.scale = Math.max(cam.scale / 2, 0.25);
    amount += 500;
  }
  cam.x -= click.x / cam.scale;
  cam.y -= click.y / cam.scale;
  cam.x = roundToPrec(cam.x, 1/cam.scale); //snap to remove gaps
  cam.y = roundToPrec(cam.y, 1/cam.scale);
  frame();
}

function checkColorIntegrety() {
  if (currentColor >= colors.length) currentColor = colors.length - 1;
  if (currentColor < 0) currentColor = 0;
}

function addColor() {
  let color = prompt("Enter Color:");
  if (color === null || color === "") {
    return;
  }
  colors.push(color);
  currentColor = colors.length - 1;
  setSelectedType(currentColor);
}

function deleteColor() {
  if (confirm(`Delete color ${colors[currentColor]}?`)) {
    colors.splice(currentColor, 1);
    for (let elem of elems) { // collapse colors
      if (elem.type >= currentColor) elem.type -= 1;
      if (elem.type < 0) elem.type = 0;
    }
    currentColor -= 1;
    // checkColorIntegrety();
  }
}

function changeColor() {
  let color = prompt(`Enter new Color (from ${colors[currentColor]}):`);
  if (color === null || color === "") {
    return;
  }
  colors[currentColor] = color;
}

function rearrangeColor(from, to) {
  // TODO
}