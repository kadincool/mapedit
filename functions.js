// select
function startSelection(click) {
  // TODO make reselect if topmost isnt in selected
  if (checkBitfield(click.modifiers, 0) || !(boundingBox.active && boundingBox.isIntersectP(click))) { // not in bounding box
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
  // TODO make show size when scaling
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
  deleteTiny();
  releaseScale(click);
  //dragAdd(click);
  //selected.first.value.snap();
  //boundingBox.setBounds(selected);
}

function startDelete(click) {
  // TODO
}

function dragDelete(drag) {
  // TODO
}

function releaseDelete(click) {
  // TODO
}

function deleteSelected() {
  for (let elem of selected) {
    elem.wid = 0;
    elem.hei = 0;
  }
  deleteTiny();
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
  // TODO remember to shift down one
}

function setSelectedType(type) {
  // TODO
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
    // console.log(topMost);
    if (topMost) hover.append(topMost);
  }
}

function zoom(amount, click) {
  //TODO: make scroll into cursor position
  if (amount > 0) while (amount > 0) {
    cam.scale = Math.min(cam.scale * 2, 128);
    amount -= 500;
  }
  else if (amount < 0) while (amount < 0) {
    cam.scale = Math.max(cam.scale / 2, 0.25);
    amount += 500;
  }
}