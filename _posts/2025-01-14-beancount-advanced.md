---
layout: post
title: Beancount 记账进阶
category: life
tags:
    - beancount
    - rsu
    - stock
    - economy
    - house
---
上一篇讲了把个人记账软件切换到 Beancount，这篇继续聊下一些进阶用法。

### RSU & 股票记账
RSU 奖励是一种预期获益，准确说未归属的部分是一种赠予协议（承诺），只有每年确定归属的部分才能算是产生了收入，且归属时要按所得价值进行**个人所得缴税**（不同档位税率不同，个人所得税最高可以到 45%）** **，最后在股票交易时还会视超出成本的增量所得收缴**资本利得税**（20%）。

> 签订RSU协议 -> 按计划归属 -> 缴税存股（成本价） -> 交易（市价） -> 缴纳所得税（市价 > 成本价）
>

流程如上，所以如果只计算收入和支出，并不一定需要把未归属的 RSU 部分也记录下来。把每次的股票归属看做公司以归属时市价赠予一定数量的股票（应纳税收益），而这个市价即为后续股票交易的成本价。

<!--more-->

> 应纳税收益 = RSU归属数量 * 计税价格（归属前一日股票收盘价） * 汇率（归属前一日人民币/美金汇率）
>

以同样是归属 1000 股 BABA（市价 80 USD） 适用税率 20% 来举例说明，根据不同的缴税方式有两种情况：

1. 现金缴税
2. 卖股缴税

```
;;定义通货&价格
2020-01-01 commodity BABA
  name: "AlibabaGroup Inc."
  quote: USD
;;通货价格更新
2021-01-01 price BABA 72.36 USD

;;现金缴税情况：建议分为两个交易记录，一笔缴税，一笔存股
2022-01-01 * "中银国际" "2022年RSU股权激励发放-存股"
  Income:Salary:RSU                  -1000 BABA {80.00 USD}
  Assets:Stock:BoC:RSU:BABA          1000 BABA {80.00 USD}
2022-01-01 * "2022年RSU股权激励发放-个人所得税"
  Assets:Bank:CMBCHINA               -16000 USD {7.00 CNY}
  Expenses:Government:Tax

;;卖股抵税，则可以一笔记录
2022-01-01 * "中银国际" "2022年RSU股权激励发放-归属"
  Income:Salary:RSU                  -1000 BABA {80.00 USD}
  Assets:Stock:BoC:RSU:BABA          800 BABA {80.00 USD}
  Expenses:Government:Tax
```

理论上归属利润都是 = 应纳税收益 - 税费 = 64000 USD。但是卖股抵税是有时间差的，卖出价格不一定是 80 USD，可能高也可能低，如果卖出时价格更高，则存入股数就大于 800（赚到了），反之则会损失一些。

```
;;比如卖股抵税时价格涨到了85
2022-01-01 * "中银国际" "2022年RSU股权激励发放-归属"
  Income:Salary:RSU                -1000 BABA {80 USD}
  Expenses:Government:Tax          189 BABA {85 USD} ;实际卖出总价是16065
  Assets:Stock:BoC:RSU:BABA        811 BABA {80 USD} @ 85 USD ;实际存股数，成本80
  Expenses:Government:Tax          -65 USD ;退回超卖的部分价值
  Assets:Stock:BoC                 65 USD  ;退回超卖的部分价值
  Income:Investing                         ;额外得到945投资收益：880 + 65
```

卖出股票和贵金属通货交易类似，值得一提的是股票交易有批次的概念，即 **FIFO** 原则：

> 在股票交易中，FIFO（先进先出）是一项重要的会计原则，尤其在税务方面。它要求投资者在出售股票时，必须先卖出最早购买的股票份额，以此来确定持有期和相应的资本利得。这种规则有助于计算投资收益，因为它确保了长期和短期资本利得的正确划分。长期资本利得通常享有更低的税率，而短期资本利得则按普通所得税率征税。
>

在 Beancount 中，默认为 [STRICT](https://beancount.github.io/docs/how_inventories_work.html#strict-booking) 模式，不过我们可以为某个账户显式声明遵循 [FIFO](https://beancount.github.io/docs/how_inventories_work.html#per-account-booking-method) 库存管理模式，这样就可以让 Beancount 自动选择股票批次和成本价

```
;;开户
2021-01-01 open Assets:Stock:BoC:RSU:BABA BABA "FIFO"

;;RSU归属，股票买入
2022-01-01 * "中银国际" "RSU归属"
  Income:Salary:RSU              -1000 BABA {80.00 USD}
  Assets:Stock:BoC:RSU:BABA      800 BABA {80.00 USD}
  Expenses:Government:Tax

2022-07-01 * "中银国际" "RSU归属"
  Income:Salary:RSU              -200 BABA {72.00 USD}
  Assets:Stock:BoC:RSU:BABA      160 BABA {72.00 USD}
  Expenses:Government:Tax

;;股票卖出，声明FIFO模式，可以合并批次简化格式，更符合实际需求
2023-01-01 * "卖出股票FIFO"
  Assets:Stock:BoC:RSU:BABA     -900 BABA {} @ 87.90 USD ;卖出价87.9，成本价和批次自动计算
  Assets:Stock:BoC:Cash         79,105.00 USD ;实际进账
  Expenses:Stock:Fee            5.00 USD ;交易手续费
  Income:Investing                       ;利润

;;如果不使用FIFO声明，则需补全卖出批次与成本价，结果是等价的
2023-01-01 * "卖出股票"
  Assets:Stock:BoC:RSU:BABA     -800 BABA {80 USD} @ 87.90 USD
  Assets:Stock:BoC:RSU:BABA     -100 BABA {72 USD} @ 87.90 USD
  Assets:Stock:BoC:Cash         79,105.00 USD ;实际进账
  Expenses:Stock:Fee            5.00 USD ;交易手续费
  Income:Investing
```

### 固定资产记账
手搓资产负债表的时候，我习惯于只记录不动产当前市价，这会没有办法看到成本与收益，也会造成当前资产虚高的假象。不动产本质上也是一类投资，和股票买卖一样，房子在买入时有成本价，只有在卖出时才会实现价值变现。

使用 Beancount 的成本盈亏模型，可以更**直观的反映出房子在成本和现价的利润变化**。关于不动产的账户定义，我更建议以房屋每平米单价自定义出通货来跟踪，举例说明：

```
;;通货定义
2020-01-01 commodity HOUSE.A ;A房屋每平米单价
  name: "A房屋"
2020-01-01 commodity HOUSE.B ;B房屋每平米单价
  name: "B房屋"

;;不动资产开户
2020-01-01 open Assets:Property:A HOUSE.A
2020-01-01 open Assets:Property:B HOUSE.B

;;初始化买入
2021-01-01 * "A房屋买入"
  Assets:Property:A   100 HOUSE.A {20000.00 CNY} ;A房屋买入单价、面积
  Equity:Opening-Balances

2022-01-01 * "B房屋买入"
  Assets:Property:B   80 HOUSE.B {30000.00 CNY} ;B房屋买入单价、面积
  Equity:Opening-Balances

;;跟踪单价变化引起的资产变化
2024-12-01 price HOUSE.A 40000.00 CNY ;单价上涨
2024-12-01 price HOUSE.B 28000.00 CNY ;单价下跌
```

活用 Beancount 的通货体系，可以给任意物品定义价格，比如一辆车、一块布等等等等

```
2020-01-01 commodity CAR.T
  name: "Tesla"
2024-12-01 open Assets:Vehicle:T CAR.T
2024-12-01 * "购入新车"
  Assets:Vehicle:T 1 CAR.T {300,000 CNY} @@ 300,000 CNY
  Equity:Opening-Balances
2025-01-11 price CAR.T 250,000 CNY
```
