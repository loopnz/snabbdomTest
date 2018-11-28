const vnode = require('./vnode');
const api = require('./htmldomapi');
const is = require('./is');
const emptyNode = vnode('', {}, [], undefined, undefined);

function sameVnode(vnode1, vnode2) {

    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function isVnode(vnode) {
    return vnode.sel !== undefined;
}

function isUndef(s) {
    return s === undefined;
}

function isDef(s) {
    return s !== undefined;
}

function createKeyToOldIdx(children, startIdx, endIdx) {
    let map = {};
    let key;
    let i = startIdx;
    for (; i <= endIdx; i++) {
        let item = children[i];
        if (item != null) {
            key = item.key;
            if (key !== undefined) {
                map[key] = i;
            }
        }
    }
    return map;
}

const hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

function init(modules) {

    var i, j, cbs = {};

    for (i = 0; i < hooks.length; i++) {
        cbs[hooks[i]] = [];
        for (j = 0; j < modules.length; j++) {
            var hook = modules[j][hooks[i]];
            if (hook !== undefined) {
                cbs[hooks[i]].push(hook);
            }
        }
    }


    function emptyNodeAt(elm) {
        var id = elm.id ? '#' + elm.id : '';
        var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
        return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
    }

    function createElm(vnode, insertedVnodeQueue) {
        var i, data = vnode.data;

        var children = vnode.children,
            sel = vnode.sel;

        if (sel === '!') {
            if (isUndef(vnode.text)) {
                vnode.text = '';
            }
            vnode.elm = api.createComment(vnode.text);
        } else if (sel !== undefined) {

            var hashIdx = sel.indexOf('#');
            var dotIdx = sel.indexOf('.');
            var hash = hashIdx > 0 ? hashIdx : sel.length;
            var dot = dotIdx > 0 ? dotIdx : sel.length;
            var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
            var elm = vnode.elm = api.createElement(tag);
            if (hash < dot) {
                elm.setAttribute('id', sel.slice(hash + 1, dot));
            }
            if (dotIdx > 0) {
                elm.setAttribute('class', sel.slice(dot + 1).replace(/\./g, ' '));
            }

            for (i = 0; i < cbs.create.length; i++) {
                cbs.create[i](emptyNode, vnode);
            }

            if (is.array(children)) {
                for (var i = 0; i < children.length; i++) {
                    var ch = children[i];
                    if (ch != null) {
                        api.appendChild(elm, createElm(ch, insertedVnodeQueue));
                    }
                }
            } else if (is.primitive(vnode.text)) {
                api.appendChild(elm, api.createTextNode(vnode.text));
            }
        } else {
            vnode.elm = api.createTextNode(vnode.text);
        }

        return vnode.elm;
    }

    function createRmcb(element, listeners) {

        return function () {
            if (--listeners === 0) {
                let parent = api.parentNode(element);
                api.removeChild(parent, element);
            }
        }
    }

    function invokeDestroyHook(vnode) {

    }

    function addVnodes(parent, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
        for (; startIdx <= endIdx; ++startIdx) {
            var ch = vnodes[startIdx];
            if (ch != null) {
                api.insertBefore(parent, createElm(ch, insertedVnodeQueue), before);
            }
        }
    }

    function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
        for (; startIdx <= endIdx; startIdx++) {
            let j, listeners, rm, ch = vnodes[startIdx];
            if (ch != null) {
                if (isDef(ch.sel)) {
                    listeners = cbs.remove.length + 1;
                    rm = createRmcb(ch.elm, listeners);
                    for (j = 0; j < cbs.remove.length; j++) {
                        cbs.remove[j](ch, rm);
                    }
                    if (isDef(j = ch.data) && isDef(j = j.hook) && isDef(j = j.remove)) {
                        j(ch, rm);
                    } else {
                        rm();
                    }
                } else {
                    api.removeChild(parentElm, ch.elm);
                }
            }
        }

    }

    function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
        var oldStartIdx = 0,
            newStartIdx = 0;
        var oldEndIdx = oldCh.length - 1;
        var oldStartVnode = oldCh[0];
        var oldEndVnode = oldCh[oldEndIdx];
        var newEndIdx = newCh.length - 1;
        var newStartVnode = newCh[0];
        var newEndVnode = newCh[newEndIdx];
        var oldKeyToIdx;
        var idxInOld;
        var elmToMove;
        var before;
        while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
            if (oldStartVnode == null) {
                oldStartVnode = oldCh[++oldStartIdx];
            } else if (sameVnode(oldStartVnode, newStartVnode)) {
                patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
                oldStartVnode = oldCh[++oldStartIdx];
                newStartVnode = newCh[++newStartIdx];
            } else if (sameVnode(oldEndVnode, newEndVnode)) {
                patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
                oldEndVnode = oldCh[--oldEndIdx];
                newEndVnode = newCh[--newEndIdx];
            } else {
                if (oldKeyToIdx === undefined) {
                    oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
                }
                idxInOld = oldKeyToIdx[newStartVnode.key];
                if (isUndef(idxInOld)) {
                    api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    newStartVnode = newCh[++newStartIdx];
                } else {
                    elmToMove = oldCh[idxInOld];
                    if (elmToMove.sel !== newStartVnode.sel) {
                        api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
                    } else {
                        patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
                        oldCh[idxInOld] = undefined;
                        api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
                    }
                    newStartVnode = newCh[++newStartIdx];
                }
            }

        }

        if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
            if (oldStartIdx > oldEndIdx) {
                before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
                addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
            } else {
                removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
            }
        }


    }

    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var i, hook;

        var elm = vnode.elm = oldVnode.elm;
        var oldCh = oldVnode.children;
        var ch = vnode.children;
        if (oldVnode === vnode) {
            return;
        }

        if (vnode.data !== undefined) {
            for (i = 0; i < cbs.update.length; i++) {
                cbs.update[i](oldVnode, vnode);
            }
            i = vnode.data.hook;
            if (isDef(i) && isDef(i = i.update)) {
                i(oldVnode, vnode);
            }
        }

        if (isUndef(vnode.text)) {

            if (isDef(oldCh) && isDef(ch)) {
                if (oldCh !== ch) {
                    updateChildren(elm, oldCh, ch, insertedVnodeQueue);
                }
            } else if (isDef(ch)) {
                if (isDef(oldVnode.text)) {
                    api.setTextContent(elm, '');
                }
                addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
            } else if (isDef(oldCh)) {
                removeVnodes(elm, oldCh, 0, oldCh.length - 1);
            } else if (isDef(oldVnode.text)) {
                api.setTextContent(elm, '');
            }
        } else if (oldVnode.text !== vnode.text) {
            api.setTextContent(elm, vnode.text);
        }


    }


    return function patch(oldVnode, vnode) {
        let i, elm, parent;
        let insertedVnodeQueue = [];
        if (!isVnode(oldVnode)) {
            oldVnode = emptyNodeAt(oldVnode);
        }
        if (sameVnode(oldVnode, vnode)) {
            patchVnode(oldVnode, vnode, insertedVnodeQueue);
        } else {
            elm = oldVnode.elm;
            parent = api.parentNode(elm);
            createElm(vnode, insertedVnodeQueue);
            if (parent !== null) {
                api.insertBefore(parent, vnode.elm, api.nextSibling(elm));
            }
        }
        return vnode;
    }
}
exports.init = init;