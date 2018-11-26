const vnode = require('./vnode');
const api = require('./htmldomapi');

function toVNode(node) {
    let text;
    if (api.isElement(node)) {
        var id = node.id ? '#' + node.id : '';
        var cn = node.getAttribute('class');
        var c = cn ? '.' + cn.split(' ').join('.') : '';
        var sel = api.tagName(node).toLowerCase() + id + c;
        var attrs = {};
        var children = [];
        var name_1;
        var i, n;
        var elmAttrs = node.attributes;
        var elmChildren = node.childNodes;
        for (i = 0, n = elmAttrs.length; i < n; i++) {
            name_1 = elmAttrs[i].nodeName;
            if (name_1 !== 'id' && name_1 !== 'class') {
                attrs[name_1] = elmAttrs[i].nodeValue;
            }
        }
        for (i = 0, n = elmChildren.length; i < n; i++) {
            children.push(toVNode(elmChildren[i]));
        }

        var vn = vnode(sel, {
            attrs: attrs
        }, children, undefined, node)

        return vn;
    } else if (api.isText(node)) {
        text = api.getTextContent(node);
        return vnode(undefined, undefined, undefined, text, node);
    } else if (api.isComment(node)) {
        text = api.getTextContent(node);
        return vnode('!', {}, [], text, node);
    } else {
        return vnode('', {}, [], undefined, node);
    }

}

exports.toVNode = toVNode;