const vnode = require('./vnode');
const api = require('./htmldomapi');

function sameVnode(vnode1, vnode2) {

    return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function isVnode(vnode) {
    return vnode.sel !== undefined;
}

function init() {


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

        }



    }

    function patchVnode(oldVnode, vnode, insertedVnodeQueue) {
        var i, hook;

        var elm = vnode.elm = oldVnode.elm;

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
        }
        return vnode;
    }
}
exports.init = init;