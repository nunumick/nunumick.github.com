---
layout: post
title: JS 异步编程之四：理解异步函数（AsyncFunction）
category: front-end
tags:
    - javascript
    - es2017
    - async
    - await
---

有了[前序内容](/blog/2017/07/18/iterator-in-javascript.html)的了解，再来看 async 函数和 await 关键字，会更容易理解他们的本质。

官方 demo 代码：

```javascript
/**
 * case from mdn
 */

function resolveAfter2Seconds(x) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(x);
    }, 2000);
  });
}

async function f1() {
  const x = await resolveAfter2Seconds(10);
  console.log(x); // 10
}

f1();
```

### 新的武器

使用 async & await 处理之前的代码，替换 generator 和 yield，async 函数等价于自带 co 执行器的 generator 函数。

<!--more-->

```javascript
//语法有变化，但代码逻辑不变
const genToAsyncFunction = async function () {
  let a = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(10);
    }, 1000);
  });

  let b = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(20);
    }, 2000);
  });

  let c = await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(15);
    }, 1000);
  });

  let d = await 5;

  let e = a + b + c + d;

  console.log(e);

  return e;
};

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

async function runPromises() {
  let t1 = await promiseA(s1);
  let t2 = await promiseB(t1 + s2);
  let t3 = await promiseC(t2);
  let t4 = await promiseD(t1);
  let result = await genToAsyncFunction().then((t5) => {
    return Promise.resolve(t3 + t4 + t5);
  });
  return result;
}

runPromises().then((result) => console.log(result));
```

会发现除了函数声明方式和关键字发生了替换，其他地方都没有改变，程序执行结果也是一样的。于是不难理解 async & await 是语法糖这类说法，本质上应该是在底层应用了 Iterator & Generator 特性及其底层机制。
