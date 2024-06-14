---
layout: post
title: JS 异步编程之二：理解生成器（Generator）
category: front-end
tags:
    - javascript
    - ecma
    - es6
    - generator
---

上篇学习了[迭代器](/blog/2017/07/18/iterator-in-javascript.html)的应用原理，我们知道可以用生成器（generator）来返回迭代方法，简化对象迭代器的实现。这篇我们学习生成器的相关知识点。

先来看下官方定义：

> The Generator object is returned by a generator function and it conforms to both the iterable protocol and the iterator protocol.
> Generator is a subclass of the hidden Iterator class.

可知 Generator 对象是迭代器的子类，同样遵循迭代协议。其作用就是用于生成迭代方法。

> 虽然自定义迭代器是一个有用的工具，但由于需要显式地维护其内部状态，因此创建时要格外谨慎。生成器函数（Generator 函数）提供了一个强大的替代选择：它允许你定义一个非连续执行的函数作为迭代算法。生成器函数使用 function* 语法编写。

```javascript
//生成器函数内部每个yield语句定义了生成器暂停执行并返回值给调用者的一个点。
//当生成器恢复执行时，它会从暂停处继续，保持其内部状态不变。
function* geA() {
  yield "a1";
  yield "a2";
  yield "a3";
  yield "a4";
}

//显式调用geA()返回的迭代器对象
//自动反复调用其.next()方法，直到迭代器耗尽（即.next().done为true）
for (let item of geA()) {
  console.log(item);
}

/**
* output:
a1
a2
a3
a4
*/
```

### 异步编程

JS 的异步函数并不会阻塞代码执行顺序，想要通过按照异步函数编写的顺序来实现同步的执行结果并不容易。
<!--more-->

```javascript
//生成器返回迭代器
let ge = geA();

/*
 * 在js中，延时方法因为异步特性，这样写并不会得到期待的
 * a1
 * sleep 1s
 * sleep function A done
 * a2
 * a3
 * 结果
 */
console.log(ge.next().value); //a1

let promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log("sleep 1s");
    resolve("sleep function A done");
  }, 1000);
});

promise.then((res) => {
  console.log(res);
  console.log(ge.next().value); //a3
});

console.log(ge.next().value); //a2

/*
 * 我们需要这样串联起 promise 函数
 */
console.log(ge.next().value); //a1

let promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log("sleep 1s");
    resolve("sleep function A done");
  }, 1000);
});

promise.then((res) => {
  console.log(res);
  return ge.next().value; //a2
}).then((res)=>{
  console.log(res);
  console.log(ge.next().value); //a3
})
```

### yield & next()

生成器可以通过 yield 语句来暂停执行，并在得到调用 next() 方法时继续，我们可以给 next 方法传递参数作为 yield 语句参与运算的值。这样便可以形成一个运算控制链。

可以思考下面这段代码的执行结果。

```javascript
//探究generator yield & next
const geB = function* (v) {
  let v1, v2, v3, v4, v5, v6, v7, v8;
  v1 = yield v + 1;
  console.log(v1);
  v2 = yield v1 + 2; //这一行可以拿上一个yield的返回值做运算，但需要next()传递进来
  console.log(v2);
  v3 = yield v2 + 3;
  console.log(v3); //v3赋值成功
  console.log(v4); //v4未定义
  yield v4 + 4;
  console.log(v4);
  v8 = yield v + v1 + v2 + v3 + v4 + v5 + v6 + v7;
  console.log(v, v1, v2, v3, v4, v5, v6, v7, v8);
  yield v + v8;
  yield* geA();
};

let geb = geB(100);

console.log(geb.next(1)); //第一个yield返回值传递没有作用，此时 v1 为 undefined，console.log(v1)未执行
console.log(geb.next(2)); //往下执行第一个yield后的代码，v1赋值，并参与 +2 运算
console.log(geb.next(10)); //可以随意修改赋值
console.log(geb.next(1)); //由此可看出，将yield表达式赋值给变量，next() -> yield 语句运行 -> next(yield result) 可形成闭环
console.log(geb.next(1, 2, 3, 4)); //next()只支持一个参数，且必定为上一yield表达式的返回值
console.log(geb.next(400)); //500
console.log(geb.next());
console.log(geb.next());
console.log(geb.next());
```

首次调用：geb.next(1) 开始执行生成器。首先，v + 1 计算得到 101 作为第一个 yield 表达式的返回值。由于这是生成器的第一次执行，此时并没有接收任何外部传入的值来更新 v1，因此 v1 仍然为 undefined，不会打印 console.log(v1)。
输出：{ value: 101, done: false }

第二次调用：geb.next(2) 继续执行生成器。由于上一步已经返回 101，这次调用传入的 2 被赋给 v1，接着执行 console.log(v1) 打印 v1 的值，即 2。
yield 表达式：计算 v1 + 2 得到 4，作为第二个 yield 表达式的返回值。
输出：控制台输出 2（来自console.log(v1)）和 { value: 4, done: false }

第三次调用：geb.next(10) 继续执行生成器。v2 被赋值为传入的 10，接着打印 v2 的值，即 10。
yield 表达式：计算 v2 + 3 得到 13，作为第三个 yield 表达式的返回值。
输出：控制台输出 10（来自console.log(v2)）和 { value: 13, done: false }

第四次调用：geb.next(1) 继续执行生成器。v3 被赋值为传入的 1，接着打印 v3 的值，即 1。
打印未定义的 v4：此时尝试打印未定义的 v4，输出 undefined。
yield表达式：尽管 v4 未定义，但仍尝试计算 undefined + 4，得到 NaN。
输出：控制台依次输出 1、undefined 和  {value: NaN, done: false}

由此可见 next() 方法返回 yield 语句的执行结果，可以为下一次 yield 语句传递值，进而形成一个可控循环。

### 利用 generator 特性支持同步编程

可以利用 yield 和 next() 的链式特性，将多个 promise 串联起来使用。形如

promise.then.then.then.then... 这种写法可以转变为
```
p1 = yield p0.then;
p2 = yield p1.then;
p3 = yield p2.then;
```

来看看实际的例子：

```javascript
let [s1, s2, s3, s4] = [2000, 500, 0, 100];

const promiseA = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("sleep 2s");
      resolve("done");
    }, s1);
  });
};

const promiseB = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("sleep 0.5s");
      resolve("done");
    }, s2);
  });
};

const promiseC = () => {
  return new Promise((resolve, reject) => {
    resolve("done");
  });
};

const promiseD = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("sleep for a while");
      resolve("done");
    }, s4);
  });
};

/*
 * 编写一个首尾相接，同步执行的生成器函数
 * 正确执行顺序和结果：
 * 1. sleep 2s, a1
 * 2. sleep 0.5s, a2
 * 3. a3
 * 4. sleep for a while, a4
 * 总延时在2600左右
 */
const promiseGen = function* (start) {
  const newGeA = geA();
  console.log("------ promise generator start ------");
  let timeStart;
  let step1 = yield start.then(() => {
    timeStart = +new Date();
    return promiseA().then(() => {
      return newGeA.next().value;
    });
  });
  let step2 = yield step1.then(() => {
    return promiseB().then(() => {
      return newGeA.next().value;
    });
  });
  let step3 = yield step2.then(() => {
    return promiseC().then(() => {
      return newGeA.next().value;
    });
  });
  let step4 = yield step3.then(() => {
    return promiseD().then(() => {
      let timeEnd = +new Date();
      console.log(s1 + s2 + s3 + s4, timeEnd - timeStart);
      return newGeA.next().value;
    });
  });

  let step5 = yield step4.then(() => {
    console.log("------ promise generator end ------");
    console.log("------ async demo start ------");
    asyncDemo();
    return new Promise((res, rej) => {
      setTimeout(() => {
        res("async done");
        console.log("------ async demo end ------");
      }, 3000);
    });
  });

  let step6 = yield step5.then(() => {
    syncDemo();
  });

  return step6;
};

//手动调用next()一步步执行生成器
function runGenerator(){
  //获得生成器的迭代器
  let newGen = promiseGen(Promise.resolve("start"));

  //同步写法，本质上通过yield与next建立了链式反应
  let p1 = newGen.next().value.then((res) => {
  console.log("gen:", res);
  });
  let p2 = newGen.next(p1).value.then((res) => {
  console.log("gen:", res);
  });
  let p3 = newGen.next(p2).value.then((res) => {
  console.log("gen:", res);
  });
  let p4 = newGen.next(p3).value.then((res) => {
  console.log("gen:", res);
  });
  let p5 = newGen.next(p4).value;
  let p6 = newGen.next(p5);
  console.log(newGen.next(100086)); //先打印出结果了，{value: 100086, done: true}
}

//对照组A
//同步的写法，异步执行，顺序是乱的
function asyncDemo() {
  const newGe = geA();
  promiseA().then((res) => {
    console.log("async:", newGe.next().value);
  });
  promiseB().then((res) => {
    console.log("async:", newGe.next().value);
  });
  promiseC().then((res) => {
    console.log("async:", newGe.next().value);
  });
  promiseD().then((res) => {
    console.log("async:", newGe.next().value);
  });
}

//对照组B
//为了保证执行顺序，链式写法
function syncDemo() {
  const newGe = geA();
  console.log("------ sync demo start ------");
  promiseA().then((res) => {
    console.log("sync:", newGe.next().value);
    promiseB().then((res) => {
      console.log("sync:", newGe.next().value);
      promiseC().then((res) => {
        console.log("sync:", newGe.next().value);
        promiseD().then((res) => {
          console.log("sync:", newGe.next().value);
          console.log("------ sync demo end ------");
        });
      });
    });
  });
}

//执行
runGenerator();
```

控制台输出结果：

```console
------ promise generator start ------
{value: 100086, done: true}
sleep 2s
gen: a1
sleep 0.5s
gen: a2
gen: a3
sleep for a while
2600 2608
gen: a4
------ promise generator end ------
------ async demo start ------
async: a1
sleep for a while
async: a2
sleep 0.5s
async: a3
sleep 2s
async: a4
------ async demo end ------
------ sync demo start ------
sleep 2s
sync: a1
sleep 0.5s
sync: a2
sync: a3
sleep for a while
sync: a4
------ sync demo end ------
```
