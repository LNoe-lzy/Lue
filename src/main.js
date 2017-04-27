// function Lue(options) {
//     this.$options = options;
//     this.$el = document.querySelector(options.el);
//     this.currentNodeList = [];

//     this.fragment = document.createDocumentFragment();

//     this.currentNodeList.push(this.fragment);

//     this.$mount();

//     this.$el.parentNode.replaceChild(this.fragment, this.$el);
// }

// Lue.prototype = {
//     constructor: Lue,
//     $mount: function () {
//         this._compile();
//     },
//     _compile: function () {
//         this._compileNode(this.$el);
//     },
//     // 根据nodeType处理node节点
//     _compileNode: function (node) {
//         var type = node.nodeType;
//         switch (type) {
//             case 1:
//                 this._compileElement(node);
//                 break;
//             case 3:
//                 this._compileText(node);
//                 break;
//             default:
//                 return;
//         }
//     },
//     _compileElement: function (node) {
//         var that = this;
//         // 创建新节点
//         var newNode = document.createElement(node.tagName);

//         if (node.hasAttributes()) {
//             var attrs = Array.prototype.slice.call(node.attributes, 0);
//             attrs.forEach(function (attr) {
//                 newNode.setAttribute(attr.name, attr.value);
//             });
//         }

//         // 获取准备替代的节点
//         var currentNode = this.currentNodeList[this.currentNodeList.length - 1].appendChild(newNode);

//         // 判断节点是否含有子节点
//         if (node.hasChildNodes) {
//             this.currentNodeList.push(currentNode);
//             var childNodes = Array.prototype.slice.call(node.childNodes, 0);
//             childNodes.forEach(function (child) {
//                 that._compileNode(child);
//             })
//         }

//         this.currentNodeList.pop();
//     },
//     _compileText: function (node) {

//         var nodeValue = node.nodeValue;

//         var pattern = /\{\{(.+?)\}\}/g;
//         var ret = nodeValue.match(pattern);
//         if (!ret) {
//             return;
//         }
//         ret.forEach(function (value) {
//             var property = value.replace(/[{}]/g, '');
//             nodeValue = nodeValue.replace(value, '222');
//         });

//         this.currentNodeList[this.currentNodeList.length - 1].appendChild(document.createTextNode(nodeValue));

//     }
// }

class Lue {
    constructor(options) {
        this.$options = options;
        this.$el = document.querySelector(options.el);
        this.currentNodeList = [];
        this.fragment = document.createDocumentFragment();
        this.currentNodeList.push(this.fragment);
        this._mount();
        this.$el.parentNode.replaceChild(this.fragment, this.$el);
        this.$el = document.querySelector(options.el);
    }
    _mount() {
        this._compile();
    }
    _compile() {
        this._compileNode(this.$el);
    }
    _compileNode(node) {
        let nodeType = node.nodeType;
        switch (nodeType) {
            case 1:
                this._compileElement(node);
                break;
            case 3:
                this._compileText(node);
                break;
            default:
                return;
        }
    }
    _compileElement(node) {
        let that = this;
        // 创建新节点
        let newNode = document.createElement(node.tagName);

        if (node.hasAttributes()) {
            Array.from(node.attributes).forEach((attr) => {
                newNode.setAttribute(attr.name, attr.value);
            });
        }

        // 获取准备替代的节点
        let currentNode = this.currentNodeList[this.currentNodeList.length - 1].appendChild(newNode);

        // 判断节点是否含有子节点
        if (node.hasChildNodes) {
            this.currentNodeList.push(currentNode);
            Array.from(node.childNodes).forEach((child) => {
                that._compileNode(child);
            });
        }

        this.currentNodeList.pop();

    }
    _compileText(node) {

        let nodeValue = node.nodeValue;

        let pattern = /\{\{(.+?)\}\}/g;
        let ret = nodeValue.match(pattern);
        if (!ret) {
            return;
        }
        ret.forEach((value) => {
            let property = value.replace(/[{}]/g, '');
            nodeValue = nodeValue.replace(value, '222');
        });

        this.currentNodeList[this.currentNodeList.length - 1].appendChild(document.createTextNode(nodeValue));

    }
}


var app = new Lue({
    el: '#app',
    data: {
        user: {
            name: 'lzy'
        }
    }
})