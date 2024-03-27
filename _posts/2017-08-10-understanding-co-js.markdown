---
layout: post
title: JS 异步编程之理解 CO
category: front-end
tags:
    - javascript
    - co
---

```javascript
const gen = function* () {
  let a = yield new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(10);
    }, 1000);
  });

  let b = yield new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(20);
    }, 2000);
  });

  let c = yield new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(15);
    }, 1000);
  });

  let d = yield 5;

  let e = a + b + c + d;

  console.log(e);

  return e;
};

const iter = function (gen, value) {
  let item = gen.next(value);
  let v = item.value;
  console.log(item);
  if (item.done) return Promise.resolve(v);

  if (v instanceof Promise) {
    return v.then((res) => {
      return iter(gen, res);
    });
  } else {
    console.log(v);
    return iter(gen, v);
  }
};

const co = function (gen) {
  let g = gen();
  return iter(g);
};

/*
co(gen).then((res)=>{
  console.log(res);
})
*/

let [s1, s2, s3, s4] = [2000, 500, 0, 100];

const promiseA = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("t1:", time);
      resolve(time);
    }, time);
  });
};

const promiseB = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("t2:", time);
      resolve(time);
    }, time);
  });
};

const promiseC = (time) => {
  return new Promise((resolve, reject) => {
    console.log("t3:", time);
    resolve(time);
  });
};

const promiseD = (time) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("t4:", time);
      resolve(time);
    }, time);
  });
};

co(function* () {
  let t1 = yield promiseA(s1);
  let t2 = yield promiseB(t1 + s2);
  let t3 = yield promiseC(t2);
  let t4 = yield promiseD(t1);
  let result = yield co(gen).then((t5) => {
    return Promise.resolve(t3 + t4 + t5);
  });
  return result;
}).then((res) => {
  console.log("result:", res);
});

```
