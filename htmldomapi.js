

function tagName(elm) {
    return elm.tagName;
}
function parentNode(elm){
    return elm.parentNode;
}

function createElement(tagName){

    return global.document.createElement(tagName);
}


module.exports = {
    tagName: tagName,
    parentNode:parentNode,
    createElement:createElement
}