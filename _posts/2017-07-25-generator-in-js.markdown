---
layout: post
title: JS 异步编程之理解生成器（Generator）
category: front-end
tags:
    - javascript
    - ecma
    - es6
    - generator
---

```javascript
/*
 * The Generator object is returned by a generator function
 * and it conforms to both the iterable protocol and the iterator protocol.
 *
 * Generator is a subclass of the hidden Iterator class.
 */

function* geA() {
  yield "a1";
  yield "a2";
  yield "a3";
  yield "a4";
}

console.log("------ normal iterator ------");
for (let item of geA()) {
  console.log(item);
}

let ge = geA();

/*
 * 超预期迭代，a1,a3,a2 -> a1,a2,a3
 */
console.log(ge.next().value); //a1

let promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log("sleep 1s");
    resolve("sleep function A done");
  }, 10);
});

promise.then((res) => {
  console.log(res);
  console.log(ge.next().value); //a3
});

console.log(ge.next().value); //a2

//generator yield & next 探究
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

/**
 * generator特性支持同步编程
 */
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
 * 正确顺序：
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

//稍作区分，整体延迟2s执行
setTimeout(() => {
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
  console.log(newGen.next(100086)); //先执行了
}, s1);

//对照组A
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
```

