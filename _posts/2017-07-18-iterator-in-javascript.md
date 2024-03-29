---
layout: post
title: JS 异步编程之一：理解迭代器（Iterator）
category: front-end
tags:
    - javascript
    - ecma
    - es6
    - iterator
---

ES2017（ES8）发布了 [async functions](/blog/2017/09/10/async-functions-in-javascript.html) 和 await 关键字等特性，极大提升了编写异步程序的便利性和代码简洁度，应该说 async & await 是一种新的语法糖，为了说明这一点，我们可以将时间回调到 ES2015（ES6）的特性发布，逐一理解 [iterator](/blog/2017/07/18/iterator-in-javascript.html)、[generator](/blog/2017/07/25/generator-in-javascript.html) 以及 TJ 大神写的中间产物 [co库](/blog/2017/08/05/understanding-co-js.html) 的应用原理，进而了解 async functions 的本质。

### 可迭代对象

ES6 中引入了迭代器和可迭代对象（iterable）的概念，并且提供了对可迭代对象的相关支持，如 for...of 循环，本质上一个可迭代对象就是内置了迭代器方法的对象，因此可以说任何对象都能够被迭代，不仅仅是数组。

```javascript
//创建一个名为arr的数组，并给它添加一个额外属性name。
const arr = [1, 2, 3, 4, 5];
arr.name = "test arr";

//使用传统的for循环遍历数组，通过索引访问并打印数组元素。
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

//使用for...of循环遍历数组。for...of适用于可迭代对象，自动调用其内置迭代器来获取每个元素。
for (let item of arr) {
  console.log(item);
}

//@@iterator
//数组都有内置迭代器方法，该方法由Symbol.iterator属性提供，返回一个迭代器对象。
console.log(arr[Symbol.iterator]);

//显式调用数组的Symbol.iterator方法并立即使用返回的迭代器对象进行遍历。
//这与直接使用for...of循环效果相同。
for (let item of arr[Symbol.iterator]()) {
  console.log(item);
}
```

### 迭代协议

迭代器是遵循了[迭代协议](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols)的对象，协议规定迭代器必须实现 next() 接口，它应该返回当前元素并将迭代器指向下一个元素，返回的对象格式为 {value:元素值, done:是否遍历结束}，其中，done 是一个布尔值。done 属性为 true 的时候，我们默认不会去读取 value, 所以最后返回的经常是 {value: undifined, done: true}

我们可以利用迭代协议规则，手动执行迭代，或者重写对象的迭代逻辑。

```javascript
//手动调用迭代器的next()方法，每次调用返回一个包含value（当前元素）和done（是否遍历结束）的对象。
const iter = arr[Symbol.iterator]();
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
/**
 *output:
{value: 1, done: false}
{value: 2, done: false}
{value: 3, done: false}
{value: 4, done: false}
{value: 5, done: false}
{value: undefined, done: true}
{value: undefined, done: true}
*/

//覆盖数组的Symbol.iterator方法，实现一个自定义迭代器。这里的实现与原生迭代器逻辑相似，只是从-1开始计数。
//增加了自定义的hasNext方法
arr[Symbol.iterator] = function () {
  let i = -1;
  let _this = this;
  let done = false;
  let value;
  return {
    next: function () {
      i++;
      value = _this[i];
      done = i < _this.length ? false : true;
      const result = {
        value,
        done,
      };
      //console.log(result);
      return result;
    },
    hasNext: function () {
      return !done;
    },
  };
};

//使用上面的自定义迭代器遍历数组。
for (let item of arr) {
  console.log(item);
}

//使用各种方式遍历数组，每调用一次数组的Symbol.iterator方法，都会返回一个新的迭代器对象
const iterA = arr[Symbol.iterator]();
let iterable = true;
while (iterable) {
  let { value, done } = iterA.next();
  iterable = !done;
  if (value) {
    console.log(value);
  }
}

//使用自定义迭代器提供的hasNext()方法来控制while循环。
const iterB = arr[Symbol.iterator]();
while (iterB.hasNext()) {
  let { value } = iterB.next();
  if (value) {
    console.log(value);
  }
}

//使用生成器函数重写Symbol.iterator方法，生成器会自动处理迭代状态，简化迭代器的实现。
arr[Symbol.iterator] = function* () {
  for (let i = 0; i < arr.length; i++) {
    yield arr[i];
  }
};

//使用生成器生成的迭代器遍历数组。
for (let item of arr) {
  console.log(item);
}
/**
*以上结果均为：
1
2
3
4
5
*/
```

### 迭代 Object 对象

非数组对象也可以被迭代，以下代码测试各种对象元素的迭代效果。

```javascript
//创建一个名为obj的对象，包含多个键值对。
const obj = {
  a: "my",
  b: "great",
  c: "ecma",
  d: 2015,
};

//添加原型链属性 e
obj.constructor.prototype.e = function () {
  console.log("hello");
};

//添加不可枚举属性 f
Object.defineProperty(obj, "f", {
  enumerable: false,
  configurable: false,
  writable: false,
  value: "prop-f",
});

//添加可枚举属性 g
Object.defineProperty(obj, "g", {
  enumerable: true,
  configurable: false,
  writable: false,
  value: "prop-g",
});

//为obj对象添加一个生成器作为迭代器，使其成为可迭代对象。迭代时，输出每个属性及其对应的值。
obj[Symbol.iterator] = function* () {
  /*
  let keys = Object.keys(obj);
  for(let i=0;i<keys.length;i++){
    yield obj[keys[i]];
  }

  //等价于
  yield* Object.values(obj);
 */

  let keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    yield `${keys[i]}: ${obj[keys[i]]}`;
  }
};

//遍历可枚举对象
for (let item of obj) {
  console.log(item);
}
/**
 *output:
a: my
b: great
c: ecma
d: 2015
g: prop-g
*/

//for...of 与 for...in的区别
//for...in不仅包括对象自身的可枚举属性，还可能包括继承自原型链的可枚举属性。
for (let k in obj) {
  console.log(k, obj[k]);
}
/**
 *output:
a my
b great
c ecma
d 2015
g prop-g
e ƒ () {
  console.log("hello");
}
*/
```
