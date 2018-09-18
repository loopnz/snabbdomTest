

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

function createTextNode(text){
    return global.document.createTextNode(text);
}

function createComment(text) {
    return document.createComment(text);
}

function nextSibling(elm){
    return elm.nextSibling;
}  

module.exports = {
    tagName: tagName,
    parentNode:parentNode,
    createElement:createElement,
    appendChild:appendChild,
    insertBefore:insertBefore,
    createTextNode:createTextNode,
    nextSibling:nextSibling,
    createComment:createComment
}