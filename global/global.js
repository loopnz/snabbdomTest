const path = require('path');
const log = console.log;


class My extends WritableStream{
    constructor(options){
        super(options);
    }
    _write(chunk,encoding,callback){

    }
}

class MyRead extends ReadableStream{
    constructor(options){
        super(options);
    }
    _read(){
        
    }
}

const my = new My();
