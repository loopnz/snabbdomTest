const assert = require('assert');
const h = require('../h');
const snabbdom = require('../snabbdom');
const patch = snabbdom.init([
    require('../modules/class')
]);
const JSDOM = require('jsdom').JSDOM;
const document = new JSDOM(`<!DOCTYPE html>`).window.document;
global.document = document;

describe('snabbdom', function () {

    let elm;
    let vnode0;

    beforeEach(function () {

        elm = document.createElement('div');
        vnode0 = elm;
    });

    describe('hypescript 创建vnode', function () {

        it('根据标签名称创建vnode', function () {
            const d = h('div');
            assert.equal(d.sel, 'div');
        });

        it("创建有children的vnode", function () {
            const div = h('div', [h('span#hello'), h('b.world')]);
            assert.equal(div.sel, 'div');
            assert.equal(div.children[0].sel, 'span#hello');
            assert.equal(div.children[1].sel, 'b.world');
        });

        it("创建只有单个child的vnode", function () {
            const vnode = h('div', h('span#hello'));
            assert.equal(vnode.sel, 'div');
            assert.equal(vnode.children[0].sel, 'span#hello');
        });

        it("创建带有props并且有单个child的vnode", function () {
            const vnode = h('div', {}, h('span#hello'));
            assert.equal(vnode.sel, 'div');
            assert.equal(vnode.children[0].sel, 'span#hello');
        });

        it("创建子节点是text的vnode", function () {
            const vnode = h('div', ['i am a string']);
            assert.equal(vnode.children[0].text, 'i am a string');
        });
        it("创建text的vnode", function () {
            const vnode = h('div', 'i am a string');
            assert.equal(vnode.text, 'i am a string');
        });

        it("创建带有props但是只有text的vnode", function () {
            const vnode = h('div', {}, 'i am a string');
            assert.equal(vnode.text, 'i am a string');
        });

        it("创建注释类型的vnode", function () {
            const vnode = h('!', 'test');
            assert.equal(vnode.sel, '!');
            assert.equal(vnode.text, 'test');

        });

    });

    describe('created element 创建真实dom', function () {

        it('从sel中获取标签名称', function () {
            const vnode = h('div');
            const elm = patch(vnode0, vnode).elm;
            assert.equal(elm.tagName, 'DIV');
        });

        it("处理不同的标签和id", function () {
            var elm = document.createElement('div');
            vnode0.appendChild(elm);
            var vnode1 = h('span#id');
            elm = patch(elm, vnode1).elm;
            assert.equal(elm.tagName, 'SPAN');
            assert.equal(elm.id, 'id');
            elm.remove();
        });

        it("从sel中获取id", function () {

            elm = patch(vnode0, h('div', [h('div#unique')])).elm;
            assert.equal(elm.firstChild.id, 'unique');
        });

        it("选择器sel中包含1个或多个class,将class解析出来",function(){
            elm = patch(vnode0,h('div',[h('i.am.a.class')])).elm;
            assert(elm.firstChild.classList.contains('am'));
            assert(elm.firstChild.classList.contains('a'));
            assert(elm.firstChild.classList.contains('class'));
        });

        it("从data的class对象中取出class,将其添加到vnode对应的elm上",function(){

            elm = patch(vnode0,h('i',{class:{
                am:true,
                a:true,
                class:true,
                not:false
            }})).elm;
            assert(elm.classList.contains('am'));
            assert(elm.classList.contains('a'));
            assert(elm.classList.contains('class'));
            assert(!elm.classList.contains('not'));
        });

    });


})