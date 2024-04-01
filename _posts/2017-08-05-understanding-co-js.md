---
layout: post
title: JS 异步编程之三：理解 Co.js
category: front-end
tags:
    - javascript
    - co
---
[Co.js](https://github.com/tj/co/blob/4.6.0/index.js) 是 TJ 大神基于 Generator 特性写的 js 库，可以用同步的方式编写和执行异步函数，核心代码只有几十行。

其本质上就是一个迭代器的执行函数，来看下面个人仿制的简写代码，理解精髓即可：

```javascript
// 定义一个生成器，包含我们要用到的异步函数
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

//编写一个递归执行的通用迭代器执行函数
//第一个入参为要执行的生成器，第二入参为 next 赋值
const iter = function (gen, value) {
  let item = gen.next(value);
  let v = item.value;
  console.log(item);
  if (item.done) return Promise.resolve(v);

  //这一步很关键，如果是异步函数，则返回v.then
  if (v instanceof Promise) {
    return v.then((res) => {
      return iter(gen, res);
    });
  } else {
    console.log(v);
    return iter(gen, v);
  }
};

//co就是对执行器的再一次包装
const co = function (gen) {
  let g = gen();
  return iter(g);
};

//test
co(gen).then((res)=>{
  console.log(res);
})
```

### 用 co 重写代码

有了这个可重用的便捷的 co 执行器，我们可以用它来重写上一篇[理解生成器（generator）](/blog/2017/07/25/generator-in-javascript.html) 文中的样例代码，替换掉手动逐行执行的那部分。

```javascript
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

//对比下这段
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

co 执行器为开发者提供了极大的便利性，让代码变的短小精悍、简洁明了，我们可以专注于生成器内部的代码逻辑，无需关注迭代执行流程，这就是早期的异步编程同步写法。ES2017 官方发布 [async & await](/blog/2017/09/10/async-functions-in-javascript.html) 后，异步编程更加轻松，co.js 退出历史舞台。

