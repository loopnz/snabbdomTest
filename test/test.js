const assert = require('assert');
const h = require('../h');
const snabbdom = require('../snabbdom');
const patch = snabbdom.init([
    require('../modules/class'),
    require('../modules/props')
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

        it("选择器sel中包含1个或多个class,将class解析出来", function () {
            elm = patch(vnode0, h('div', [h('i.am.a.class')])).elm;
            assert(elm.firstChild.classList.contains('am'));
            assert(elm.firstChild.classList.contains('a'));
            assert(elm.firstChild.classList.contains('class'));
        });

        it("从data的class对象中取出class,将其添加到vnode对应的elm上", function () {

            elm = patch(vnode0, h('i', {
                class: {
                    am: true,
                        a: true,
                        class: true,
                        not: false
                }
            })).elm;
            assert(elm.classList.contains('am'));
            assert(elm.classList.contains('a'));
            assert(elm.classList.contains('class'));
            assert(!elm.classList.contains('not'));
        });

        it("从选择器以及data中获取class", function () {
            elm = patch(vnode0, h('div', [h('i.has', {
                class: {
                    classes: true
                }
            })])).elm;

            assert(elm.firstChild.classList.contains('has'));
            assert(elm.firstChild.classList.contains('classes'));

        });

        it('使用text content 创建真实dom', function () {
            elm = patch(vnode0, h('div', ['i am a string'])).elm;

            assert(elm.innerHTML, 'i am a string');

        });
        it('子元素是span元素与text content混合时创建真实dom', function () {
            elm = patch(vnode0, h('div', [h('span'), 'i am a string'])).elm;
            assert.equal(elm.childNodes[0].tagName, 'SPAN');
            assert.equal(elm.childNodes[1].textContent, 'i am a string');
        });

        it("当有props时创建dom", function () {
            elm = patch(vnode0, h('a', {
                props: {
                    src: 'http://localhost/'
                }
            })).elm;
            assert.equal(elm.src, 'http://localhost/');
        });

        it("patch原生dom与vnode", function () {
            var elmWithIdAndClass = document.createElement('div');
            elmWithIdAndClass.id = 'id';
            elmWithIdAndClass.className = 'class';
            var vnode1 = h('div#id.class', [h('span', 'hi')]);
            elm = patch(elmWithIdAndClass, vnode1).elm;
            assert.strictEqual(elm, elmWithIdAndClass);
            assert.equal(elm.tagName, 'DIV');
            assert.equal(elm.id, 'id');
            assert.equal(elm.className, 'class');
            assert.equal(elm.childNodes[0].tagName, 'SPAN');
            assert.equal(vnode1.children[0].text, 'hi');
        });

        it('创建注释', function () {
            elm = patch(vnode0, h('!', 'test')).elm;
            assert.equal(elm.nodeType, global.document.COMMENT_NODE);
            assert.equal(elm.textContent, 'test');
        });

    });


    describe('patching an element,比较virtual dom的不同,然后渲染真实dom', function () {

        it("改变element的classes", function () {
            var vnode1 = h('i', {
                classes: {
                    i: true,
                    am: true,
                    horse: true
                }
            });
            var vnode2 = h('i', {
                classes: {
                    i: true,
                    am: true,
                    horse: false
                }
            });
            patch(vnode0, vnode1);
            elm = patch(vnode1, vnode2).elm;
            assert(elm.classList.contains('i'));
            assert(elm.classList.contains('am'));
            assert(elm.classList.contains('horse'));
        });


    });

})

var fn = function (s, l, a, i) {
    var v0, v1, v2, v3 = l && ('\u0024select' in l),
        v4, v5 = l && ('\u0024event' in l);
    if (!(v3)) {
        if (s) {
            v2 = s.$select;
        }
    } else {
        v2 = l.$select;
    }
    if (v2 != null) {
        v1 = v2.toggle;
    } else {
        v1 = undefined;
    }
    if (v1 != null) {
        if (!(v5)) {
            if (s) {
                v4 = s.$event;
            }
        } else {
            v4 = l.$event;
        }
        v0 = v2.toggle(v4);
    } else {
        v0 = undefined;
    }
    return v0;
};
return fn;
}