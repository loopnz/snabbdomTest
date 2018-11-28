const assert = require('assert');
const h = require('../h');
const snabbdom = require('../snabbdom');
const toVNode = require('../tovnode').toVNode;
const patch = snabbdom.init([
    require('../modules/class'),
    require('../modules/props')
]);
const JSDOM = require('jsdom').JSDOM;
const document = new JSDOM(`<!DOCTYPE html>`).window.document;
global.document = document;

function prop(name) {
    return function (obj) {
        return obj[name];
    }
}

function map(fn, list) {
    let ret = [];

    for (let i = 0; i < list.length; i++) {
        ret[i] = fn(list[i]);
    }
    return ret;
}

const inner = prop('innerHTML');

describe('snabbdom', function () {

    let elm;
    let vnode0;

    beforeEach(function () {

        elm = document.createElement('div');
        document.body.appendChild(elm);
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
                class: {
                    i: true,
                        am: true,
                        horse: true
                }
            });
            var vnode2 = h('i', {
                class: {
                    i: true,
                        am: true,
                        horse: false
                }
            });
            patch(vnode0, vnode1);
            elm = patch(vnode1, vnode2).elm;
            assert(elm.classList.contains('i'));
            assert(elm.classList.contains('am'));
            assert(!elm.classList.contains('horse'));
        });

        it("changes an elements props", function () {
            var vnode1 = h('a', {
                props: {
                    src: 'http://other/'
                }
            });
            var vnode2 = h('a', {
                props: {
                    src: 'http://localhost/'
                }
            });
            patch(vnode0, vnode1);
            elm = patch(vnode1, vnode2).elm;
            assert.equal(elm.src, 'http://localhost/');
        });
    });

    describe('using toVNode()', function () {

        // it('can remove previous children of the root element',function(){
        //     var h2 = document.createElement('h2');
        //     h2.textContent = 'Hello';
        //     var prevElm = document.createElement('div');
        //     prevElm.id = 'id';
        //     prevElm.className = 'class';
        //     prevElm.appendChild(h2);
        //     var nextNode = h('div#id.class',[h('span','Hi')]);
        //     var vnode = patch(toVNode(prevElm),nextNode);
        //     elm = vnode.elm;
        //     assert.strictEqual(elm,prevElm); 
        // });
    });

    describe('updating children with keys,有key的情况下更新节点', function () {

        function spanNum(n) {
            if (n == null) {
                return n;
            } else if (typeof n === 'string') {
                return h('span', {}, n);
            } else {
                return h('span', {
                    key: n
                }, n.toString());
            }
        }

        describe('addition of elements,添加元素', function () {
            it('appends elements,在后面添加节点', function () {
                var vnode1 = h('span', [1].map(spanNum));
                var vnode2 = h('span', [1, 2, 3].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 1);
                elm = patch(vnode1, vnode2).elm;
                assert.equal(elm.children.length, 3);
                assert.equal(elm.children[1].innerHTML, 2);
                assert.equal(elm.children[2].innerHTML, 3);
            });

            it('prepends elements,在前面添加节点', function () {
                var vnode1 = h('span', [4, 5].map(spanNum));
                var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 2);
                elm = patch(vnode1, vnode2).elm;
                assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5']);
            });

            it('add elements in the middle,在中间加节点', function () {
                var vnode1 = h('span', [1, 2, 4, 5].map(spanNum));
                var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 4);
                assert.equal(elm.children.length, 4);
                elm = patch(vnode1, vnode2).elm;
                assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5']);
            });

            it('add elements at begin and end,头和尾同时添加元素', function () {
                var vnode1 = h('span', [2, 3, 4].map(spanNum));
                var vnode2 = h('span', [1, 2, 3, 4, 5].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 3);
                elm = patch(vnode1, vnode2).elm;
                assert.deepEqual(map(inner, elm.children), ['1', '2', '3', '4', '5']);
            });
            it('adds children to parent with no children,给没有子节点的父元素添加节点', function () {
                var vnode1 = h('span', {
                    key: 'span'
                });
                var vnode2 = h('span', {
                    key: 'span'
                }, [1, 2, 3].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 0);
                elm = patch(vnode1, vnode2).elm;
                assert.deepEqual(map(inner, elm.children), ['1', '2', '3']);
            });

            it('removes all children from parent,移掉父节点的所有子节点', function () {
                var vnode1 = h('span', {
                    key: 'span'
                }, [1, 2, 3].map(spanNum));
                var vnode2 = h('span', {
                    key: 'span'
                });
                elm = patch(vnode0, vnode1).elm;
                assert.deepEqual(map(inner, elm.children), ['1', '2', '3']);
                elm = patch(vnode1, vnode2).elm;
                assert.equal(elm.children.length, 0);
            });

            it('update one child with same key but different sel,更新key相同但是sel不用的节点', function () {
                var vnode1 = h('span', {
                    key: 'span'
                }, [1, 2, 3].map(spanNum));
                var vnode2 = h('span', {
                    key: 'span'
                }, [spanNum(1), h('i', {
                    key: 2
                }, '2'), spanNum(3)]);
                elm = patch(vnode0, vnode1).elm;
                assert.deepEqual(map(inner, elm.children), ['1', '2', '3']);
                elm = patch(vnode1, vnode2).elm;
                assert.deepEqual(map(inner, elm.children), ['1', '2', '3']);
                assert.equal(elm.children.length, 3);
                assert.equal(elm.children[1].tagName, 'I');
            });

        });

        describe('removal of elements,移除元素', function () {
            it('removes elements from the beginning,从头移除节点', function () {
                var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
                var vnode2 = h('span', [3, 4, 5].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 5);
                elm = patch(vnode1, vnode2).elm;
                assert.deepEqual(map(inner, elm.children), ['3', '4', '5']);
            });

            it('removes elements from the end,从尾部移除节点', function () {
                var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
                var vnode2 = h('span', [1, 2, 3].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 5);
                elm = patch(vnode1, vnode2).elm;
                assert.equal(elm.children.length, 3);
                assert.equal(elm.children[0].innerHTML, '1');
                assert.equal(elm.children[1].innerHTML, '2');
                assert.equal(elm.children[2].innerHTML, '3');

            });
            it('removes elements from the middle,从中间移除元素', function () {
                var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
                var vnode2 = h('span', [1, 2, 4, 5].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 5);
                elm = patch(vnode1, vnode2).elm;
                assert.equal(elm.children.length, 4);
                assert.deepEqual(elm.children[0].innerHTML, '1');
                assert.equal(elm.children[0].innerHTML, '1');
                assert.equal(elm.children[1].innerHTML, '2');
                assert.equal(elm.children[2].innerHTML, '4');
                assert.equal(elm.children[3].innerHTML, '5');
            });
        });

        describe('element reordering,元素重新排序', function () {
            it('moves element forward,移动元素到最前面', function () {
                var vnode1 = h('span', [1, 2, 3, 4].map(spanNum));
                var vnode2 = h('span', [2, 3, 1, 4].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 4);
                elm = patch(vnode1, vnode2).elm;
                assert.equal(elm.children.length, 4);
                assert.equal(elm.children[0].innerHTML, '2');
                assert.equal(elm.children[1].innerHTML, '3');
                assert.equal(elm.children[2].innerHTML, '1');
                assert.equal(elm.children[3].innerHTML, '4');
            });
            it('moves element to end,移动元素到最后面', function () {
                var vnode1 = h('span', [1, 2, 3].map(spanNum));
                var vnode2 = h('span', [2, 3, 1].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 3);
                elm = patch(vnode1, vnode2).elm;
                assert.equal(elm.children.length, 3);
                assert.equal(elm.children[0].innerHTML, '2');
                assert.equal(elm.children[1].innerHTML, '3');
                assert.equal(elm.children[2].innerHTML, '1');
            });

            it('moves element backwards,往前面移动元素', function () {
                var vnode1 = h('span', [1, 2, 3, 4].map(spanNum));
                var vnode2 = h('span', [1, 4, 2, 3].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 4);
                elm = patch(vnode1, vnode2).elm;
                assert.equal(elm.children.length, 4);
                assert.equal(elm.children[0].innerHTML, '1');
                assert.equal(elm.children[1].innerHTML, '4');
                assert.equal(elm.children[2].innerHTML, '2');
                assert.equal(elm.children[3].innerHTML, '3');
            });

            it('swaps first and last,交换第一个和最后一个', function () {
                var vnode1 = h('span', [1, 2, 3, 4].map(spanNum));
                var vnode2 = h('span', [4, 2, 3, 1].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 4);
                elm = patch(vnode1, vnode2).elm;
                assert.equal(elm.children.length, 4);
                assert.equal(elm.children[0].innerHTML, '4');
                assert.equal(elm.children[1].innerHTML, '2');
                assert.equal(elm.children[2].innerHTML, '3');
                assert.equal(elm.children[3].innerHTML, '1');
            });

        });

        describe('组合添加元素,移除元素,元素重新排序操作', function () {

            it("move to left and replace,往左边移动以及替换元素", function () {
                var vnode1 = h('span', [1, 2, 3, 4, 5].map(spanNum));
                var vnode2 = h('span', [4, 1, 2, 3, 6].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 5);
                elm = patch(vnode1, vnode2).elm;
                assert.equal(elm.children.length, 5);
                assert.equal(elm.children[0].innerHTML, '4');
                assert.equal(elm.children[1].innerHTML, '1');
                assert.equal(elm.children[2].innerHTML, '2');
                assert.equal(elm.children[3].innerHTML, '3');
                assert.equal(elm.children[4].innerHTML, '6');
            });

            it("move to left and leaves hole,往左边移动以及替换删除", function () {
                {
                    var vnode1 = h('span', [1, 4, 5].map(spanNum));
                    var vnode2 = h('span', [4, 6].map(spanNum));
                    elm = patch(vnode0, vnode1).elm;
                    assert.equal(elm.children.length, 3);
                    elm = patch(vnode1, vnode2).elm;
                    assert.deepEqual(map(inner, elm.children), ['4', '6']);
                }
            });
            it('handles moved and set to undefined element ending at the end,往左移动元素', function () {
                var vnode1 = h('span', [2, 4, 5].map(spanNum));
                var vnode2 = h('span', [4, 5, 3].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.children.length, 3);
                elm = patch(vnode1, vnode2).elm;
                assert.equal(elm.children.length, 3);
                assert.equal(elm.children[0].innerHTML, '4');
                assert.equal(elm.children[1].innerHTML, '5');
                assert.equal(elm.children[2].innerHTML, '3');
            });
            it('moves a key in non-keyed nodes with a size up,有些节点子元素没有key', function () {
                var vnode1 = h('span', [1, 'a', 'b', 'c'].map(spanNum));
                var vnode2 = h('span', ['d', 'a', 'b', 'c', 1, 'e'].map(spanNum));
                elm = patch(vnode0, vnode1).elm;
                assert.equal(elm.childNodes.length, 4);
                assert.equal(elm.textContent, '1abc');
                elm = patch(vnode1, vnode2).elm;
                assert.equal(elm.childNodes.length, 6);
                assert.equal(elm.textContent, 'dabc1e');
            });

        });


        it('reverses elements,反转节点数组',function(){
            var vnode1 = h('span', [1, 2, 3, 4, 5, 6, 7, 8].map(spanNum));
            var vnode2 = h('span', [8, 7, 6, 5, 4, 3, 2, 1].map(spanNum));
            elm = patch(vnode0, vnode1).elm;
            assert.equal(elm.children.length, 8);
            elm = patch(vnode1, vnode2).elm;
            assert.deepEqual(map(inner, elm.children), ['8', '7', '6', '5', '4', '3', '2', '1']);
        });

    });



})