exports.array=Array.isArray;

exports.primitive = function(s){
    return typeof s==='string'||typeof s==='number';

};