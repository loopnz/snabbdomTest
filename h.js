const vnode = require('./vnode');
const is = require('./is');

function h(sel, b, c) {
    let data = {},
        children, text, i;
    if (c !== undefined) {
        data = b;
        if (is.array(c)) {
            children = c;
        } else if (is.primitive(c)) {
            text = c;
        } else if (c && c.sel) {
            children = [c];
        }
    } else if (b !== undefined) {
        if (is.array(b)) {
            children = b;
        } else if (is.primitive(b)) {
            text = b;
        } else if (b && b.sel) {
            children = [b];
        } else {
            data = b;
        }
    }

    if (children !== undefined) {
        for (i = 0; i < children.length; i++) {
            if (is.primitive(children[i])) {
                children[i] = vnode(undefined, undefined, undefined, children[i], undefined);
            }
        }
    }

    return vnode(sel, data, children, text, undefined);
}

module.exports = h;