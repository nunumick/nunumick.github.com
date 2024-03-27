---
layout: post
title: JS 异步编程之理解迭代器（Iterator）
category: front-end
tags:
    - javascript
    - ecma
    - es6
    - iterator
---

```javascript
//可迭代对象
const arr = [1, 2, 3, 4, 5];
arr.name = "test arr";

for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

for (let item of arr) {
  console.log(item);
}

//@@iterator
console.log(arr[Symbol.iterator]);

for (let item of arr[Symbol.iterator]()) {
  console.log(item);
}

//迭代协议
const iter = arr[Symbol.iterator]();
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());
console.log(iter.next());

//自定义迭代器
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

for (let item of arr) {
  console.log(item);
}

//自定义迭代方式
const iterA = arr[Symbol.iterator]();
let iterable = true;
while (iterable) {
  let { value, done } = iterA.next();
  iterable = !done;
  if (value) {
    console.log(value);
  }
}

const iterB = arr[Symbol.iterator]();
while (iterB.hasNext()) {
  let { value } = iterB.next();
  if (value) {
    console.log(value);
  }
}

//生成器生成迭代器
arr[Symbol.iterator] = function* () {
  for (let i = 0; i < arr.length; i++) {
    yield arr[i];
  }
};

for (let item of arr) {
  console.log(item);
}

//迭代Object对象
const obj = {
  a: "my",
  b: "great",
  c: "ecma",
  d: 2015,
};

//原型链属性
obj.constructor.prototype.e = function () {
  console.log("hello");
};

//不可枚举属性
Object.defineProperty(obj, "f", {
  enumerable: false,
  configurable: false,
  writable: false,
  value: "prop-f",
});

//可枚举属性
Object.defineProperty(obj, "g", {
  enumerable: true,
  configurable: false,
  writable: false,
  value: "prop-g",
});

//生成器让迭代器写法更简单
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

for (let item of obj) {
  console.log(item);
}

// for...of 与 for...in的区别
for (let k in obj) {
  console.log(k, obj[k]);
}
```
