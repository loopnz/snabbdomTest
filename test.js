const assert = require('assert');
const h = require('./h');
const snabbdom = require('./snabbdom');
const patch = snabbdom.init();
const JSDOM = require('jsdom').JSDOM;
const document = new JSDOM(`<!DOCTYPE html>`).window.document;
global.document = document;
const elm = document.createElement('div');
const vnode0 = elm;

const testFns = {
    t1: function () {
        const d = h('div');
        assert.equal(d.sel, 'div');
    },
    t2: function () {
        const div = h('div', [h('span#hello'), h('b.world')]);
        assert.equal(div.sel, 'div');
        assert.equal(div.children[0].sel, 'span#hello');
        assert.equal(div.children[1].sel, 'b.world');
    },
    t3: function () {
        const vnode = h('div', h('span#hello'));
        assert.equal(vnode.sel, 'div');
        assert.equal(vnode.children[0].sel, 'span#hello');
    },
    t4: function () {
        const vnode = h('div', {}, h('span#hello'));
        assert.equal(vnode.sel, 'div');
        assert.equal(vnode.children[0].sel, 'span#hello');
    },
    t5: () => {
        const vnode = h('div', ['i am a string']);
        assert.equal(vnode.children[0].text, 'i am a string');
    },
    t6: () => {
        const vnode = h('div', 'i am a string');
        assert.equal(vnode.text, 'i am a string');
    },
    t7: () => {
        const vnode = h('div', {}, 'i am a string');
        assert.equal(vnode.text, 'i am a string');
    },
    t8: () => {
        const vnode = h('!', 'test');
        assert.equal(vnode.sel, '!');
        assert.equal(vnode.text, 'test');
    },
    t9: () => {
        const vnode = h('div');
        const elm = patch(vnode0, vnode).elm;
        assert.equal(elm.tagName, 'DIV');
    },
    t10: function () {
        var elm = document.createElement('div');
        vnode0.appendChild(elm);
        var vnode1 = h('span#id');
        elm = patch(elm, vnode1).elm;
        assert.equal(elm.tagName, 'SPAN');
        assert.equal(elm.id, 'id');
    }

};

function runTest(str) {
    for (let key in testFns) {
        if (str) {
            if (str === key) {
                testFns[key]();
            }
        } else {
            testFns[key]();
        }
    }
}

runTest();