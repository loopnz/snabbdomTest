

function tagName(elm) {
    return elm.tagName;
}
function parentNode(elm){
    return elm.parentNode;
}
function insertBefore(parent,elem,before){

    parent.insertBefore(elem,before);

}
function appendChild(node,child){
    node.appendChild(child);
}

function createElement(tagName){

    return global.document.createElement(tagName);
}


module.exports = {
    tagName: tagName,
    parentNode:parentNode,
    createElement:createElement,
    appendChild:appendChild,
    insertBefore:insertBefore
}