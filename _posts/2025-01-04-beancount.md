---
layout: post
title: 硬核记账之路
category: life
tags:
    - beancount
    - fava
    - economy
    - python
---

### 早期记账历史
俗话说“你不理财，财不理你”，理财要从财务管理开始，如果对自己的财务状况都不清楚，理财投资也无从谈起。我个人的记账习惯始于 2010 年，正因为自己在那一年组建了小家庭，也算得上是对家庭的责任感驱使 ^_^。最初的记账需求很简单，仅仅是想记录下自己的消费，设置消费预算，不要超支。那时候的账目也简单，个人使用的是随手记 Pro 这个 APP，加上配套的卡牛账单导入也能实现多账户记账的自动化，对家庭总体的财务情况有一定了解。

![随手记Pro-1]({{site.cdnroot}}/assets/img/suishouji_01.png)

<!--more-->

![随手记Pro-2]({{site.cdnroot}}/assets/img/suishouji_02.png)

不过这个记账模式在 2014 年 12 月之后就基本停止了，有几个原因：

1. 家庭生活中的账户和账目流水变得复杂，导入的账单需要花大量时间进行手动调整、对账，**这个过程并不便利**
2. 卡牛取消了账单导入功能，记账流水开始中断
3. 最主要的，APP 开始给我**推广告**，我意识到家庭财务是敏感数据，放在三方平台可能有风险

要想了解家庭财务情况，一般会关注总体的流入流出和结余，也会关注到家庭资产与负债的情况。所以，这几年我主要按年度总结的方式手搓搞定这两个表格：

1. **现金流量表**
2. **资产负债表**

### Beancount
年度的手动统计和对账还是略显麻烦，尤其是家庭账户越来越多的时候，直到我最近尝试使用了 [beancount](https://beancount.github.io/)，貌似能够满足甚至超出我的所有需求：

基础需求：

1. **安全性**：开源，本地安装运行的软件形态，支持自托管服务
2. **轻便性**：我不是专业财务，不需要特别专业的财务软件（越是专业的软件学习成本和操作复杂度越高）
3. **自动化**：可支持各种银行账单批量导入，且方便二次编辑
4. 财务**报表**：有基础的流量表和资产表足够，其他太专业的也用不上
5. **多样性**：可以自定义货币，美元港币等，自定义多种账户类型，股票、不动产等

加分项：

1. **复式记账法**，每一笔资金的流向均有流入与流出的对象，更严谨
2. 账目**平衡**，结余断言在不平衡时的报错，保证账本的记录和现实情况在某一时候是一致的
3. **Python** + **纯文本**账本，本质上就是一堆代码，可以使用 IDE + Git 进行文本管理，对码农实在是最友好
4. **生态**良好，Github 上有许多相关项目与插件

### 复式记账法
复式记账法是现代会计体系的基础，被广泛应用于各种规模和类型的财务组织中，个人觉得其最主要的两点是**完整性**和**平衡性**。复式记账法要求每笔经济业务都要在**两个或两个以上**的账户中进行登记，这样可以全面反映经济业务的来龙去脉，避免了单式记账法可能的遗漏，保证了会计信息的完整性。另外，复式记账法的基本原理是：

> **资产 = 负债 + 所有者权益**
>

这种平衡关系有助于检查账户记录的正确性，可以及时发现并纠正错误。

基于复式记账法的原则，在 Beancount 中，最基本的一条交易流水登记需满足这样的结构：

```
2022-01-01 * "书店" "购买了两本书"
  资金流出账户-银行Account         -10 人民币
  资金流入账户-商店Account         +10 人民币
```

表述了一条基本**完整**的交易信息：在**什么时间**进行了**什么交易**，**收款方**是谁，**资金流出流入账户**分别是什么，**金额**是多少。

在这个例子中我买了两本书，付出 10 元，我的钱少了一些，但并没有消失，它只是转移到了商店的账户里。

所以每一次交易，本质上是进行了资金的转移，正如 Beancount 的字面意思一样，我们在一堆豆子中数豆子，豆子并没有减少，只是发生了转移和归属关系变化。

无论多复杂的多方交易也需满足这个**平衡**规则：

```
2022-01-01 * "书店" "购买了两本书"
  资金流出账户-银行Account         -10 人民币
  资金流入账户-商店Account          +9 人民币
  资金流入账户-平台Account          +1 人民币
```

真实的一条 Beancount 交易记录：

```
2014-03-19 * "Acme Corp" "Bi-monthly salary payment"
  Assets:MyBank:Checking             3062.68 USD     ; Direct deposit
  Income:AcmeCorp:Salary            -4615.38 USD     ; Gross salary
  Expenses:Taxes:TY2014:Federal       920.53 USD     ; Federal taxes
  Expenses:Taxes:TY2014:SocSec        286.15 USD     ; Social security
  Expenses:Taxes:TY2014:Medicare       66.92 USD     ; Medicare
  Expenses:Taxes:TY2014:StateNY       277.90 USD     ; New York taxes
  Expenses:Taxes:TY2014:SDI             1.20 USD     ; Disability insurance
```

### 成本盈亏模型
完整的一条 Beancount 交易记录格式是这样的：

```
YYYY-MM-DD [txn|Flag] [[Payee] Narration] [Flag] Account Amount [{Cost}] [@ Price] [Flag] Account Amount [{Cost}] [@ Price] ...
```

当中的 [Cost 和 Price](https://beancount.github.io/docs/how_inventories_work.html#price-vs-cost-basis) 指的是**成本价**和**市价，**这个设计在记录投资型交易或者需要计算出资产成本与盈亏时非常有用。

> **盈亏利润 = 市价 * 数量 - 成本价 * 数量**
>

比如黄金资产的记录，可以通过 Cost 和 Price 跟踪盈亏变化，值得一提的是未实现的盈亏会自动放入到 Equity:Unrealized 账户中，而一旦卖出变现，则一般看正负收益归属到 Income 收入或 Expenses 支出账户中，我个人习惯于把亏损视为负收入。

```
2022-01-01 * "买入黄金10克"
  Assets:Gold           +10 GOLD.GRAM {300 CNY}
  Assets:Bank           -3000 CNY

;;更新黄金市价，持续持有
;;Equity:Unrealized 账户中可以体现出这一潜在收益
;;资产表中也会体现出投资收益率
2022-10-10 price GOLD.GRAM 400 CNY

;;以市价 420 卖出 10 克黄金，Beancount 会自动计算市价和成本价的收益
;;银行账户实收4200，成本价自动计算3000，1200 元的收益差从 Income 中来
2023-11-01 * "卖出黄金变现"
  Assets:Gold           -10 GOLD.GRAM {} @ 420 CNY
  Assets:Bank           +4200 CNY
  Income:Investing
```

### 账户模型
在财务管理中，会计五大基本要素分别是资产、负债、所有者权益、收入和费用，这五要素通过静态会计等式“**资产=负债+所有者权益**”和动态会计等式“**收入-费用=利润**”相互关联，从而反映出总体财务状况。在 Beancount 体系中有着与这五要素相对应的[账号类型](https://beancount.github.io/docs/beancount_language_syntax.html#accounts)：

1. Assets（资产）
2. Liabilities（负债）
3. Equity（权益）
4. Income（收入）
5. Expenses（费用）

坦率说在使用 Beancount 时，会更想去体系化地学习财务知识，但也远没有到专业的程度。在我从无到有搭建家庭账本的过程中，确实让我补充学习了不少这方面的基础内容，更重要的是，这个过程同时也促使我去思考个人的账户放到这个模型中会是怎样的，以及账户怎样设计才会更合理。

![my accounts]({{site.cdnroot}}/assets/img/accounts.jpeg)

经过梳理之后的账户类型图和资金流向图，可以比较清楚了解自己的经济活动。在 Beancount 的账户体系中，可以通过 Open 指令完成开户设置。

比如以下是我的账户大类，可以再根据实际情况需要进行细分

```
* Equity
2000-01-01 open Equity:Opening-Balances
* Liabilities
2020-01-01 open Liabilities:CreditCard CNY ;信用卡
2020-01-01 open Liabilities:Alipay:HuaBei CNY ;支付宝花呗
2020-01-01 open Liabilities:Alipay:JieBei CNY ;支付宝借呗
2020-01-01 open Liabilities:Property CNY ;房贷账户
2020-01-01 open Liabilities:Vehicle CNY	;车贷
* Assets
2020-01-01 open Assets:Cash CNY ;现金
2020-01-01 open Assets:Alipay CNY ;支付宝钱包
2020-01-01 open Assets:WeChat CNY ;微信钱包
2020-01-01 open Assets:Bank:CMBCHINA CNY ;招商银行
2020-01-01 open Assets:Bank:CCB CNY ;建设银行
2020-01-01 open Assets:Bank:CMBHK USD,HKD ;招行香港一卡通
2020-01-01 open Assets:Government CNY ;社保基金
2020-01-01 open Assets:Stock USD,HKD ;股票
* Incomes
2020-01-01 open Income:Salary CNY ;工资&奖金
2020-01-01 open Income:Salary:RSU USD ;个人股权激励
2020-01-01 open Income:Government CNY ;政府补助&公积金
2020-01-01 open Income:Investing CNY,USD,HKD ;投资收益
2020-01-01 open Income:Alipay:RedPacket CNY ;支付宝红包&转账
2020-01-01 open Income:WeChat:RedPacket CNY ;微信红包&转账
* Expenses
2020-01-01 open Expenses:Food CNY ;餐饮
2020-01-01 open Expenses:Travel CNY ;交通出行
2020-01-01 open Expenses:Medical CNY ;医疗健康
2020-01-01 open Expenses:Shopping CNY ;购物消费
2020-01-01 open Expenses:WeChat CNY ;微信
2020-01-01 open Expenses:Alipay CNY ;转账红包
2020-01-01 open Expenses:JD CNY ;京东支付
2020-01-01 open Expenses:Tax CNY,USD ;税收
2020-01-01 open Expenses:Investing CNY,USD ;投资损耗
```

### 账单导入
复杂的经济活动通过手动记录的方式是很难运行下去的，自动化的账单导入是我的目标。Beancount 的 [Importer](https://github.com/maonx/Beancount-Chinese-User-Manual/blob/master/%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3/%E5%9C%A8Beancount%E4%B8%AD%E5%AF%BC%E5%85%A5%E5%A4%96%E9%83%A8%E6%95%B0%E6%8D%AE.org)可以很好的完成这一任务，基于这个 Python 类可以编写符合自己需求的导入程序。社区中有不少现成的面向国内银行、金融机构的导入脚本可以作为参考，我自己尝试过结论是不能完全照搬，因为每个人的账号体系、经济活动、交易流水和账单信息各不相同，建议一定**编写符合自己需求的**导入脚本。

我的导入脚本是在这位[清华小哥](https://github.com/jiegec/china_bean_importers)的基础上派生的分支并按个人需求改写的，感谢他的分享，省去我很多时间。比较有用的功能是**配置化导入** & **BillDetailMapping** 模式匹配，由于我个人的需求，修改成了每类账单都支持匹配且支持同时满足条件的匹配模式，这样可以提高分类匹配准确度，减少冲突

```python
if account2 is None:
    # private mapping
    if m := match_destination_and_metadata(source_config, narration, payee):
        (account2, new_meta, new_tags) = m
        metadata.update(new_meta)
        tags = tags.union(new_tags)
        if account2:
            tags.add("detail-mapping")
        else:
            account2 = unknown_account(self.config, expense)
else:
    tags.add("detail-mapping")
```

importer config 中，外层的 detail_mapping 是公共的，内层 detail_mapping 是私有的

```python
from china_bean_importers.common import BillDetailMapping as BDM

config = {
    "importers": {
        "wechat": {
            "account": "Assets:WeChat:Wallet",
            "category_mapping": {
                "商户消费": "Expenses:Shopping:Unclassified",
                "扫二维码付款": "Expenses:QRCode",
                "信用卡还款": "Liabilities:CreditCard",
            },
            "detail_mappings": [
                # 中信银行还款
                BDM([], ["中信银行信用卡还款"], "Liabilities:CreditCard:CITIC:7310", [], {}),
                BDM([], ["天猫养车"], "Expenses:Vehicle:Unclassified", [], {}),
                BDM(["浙里惠民保","保险费","保费","保险人"], [], "Expenses:Insurance", [], {}),
                BDM(["充值"], [], "Expenses:UtilityPayment", [], {}),
                BDM([], ["携程"], "Expenses:Travel", [], {}),
                BDM(["酒店"], [], "Expenses:Travel", [], {}),
            ]
        },
        "ccb_debit_card":{
            "account": "Assets:Bank:CCB:4582",
            "detail_mappings": [
                # 公积金补充匹配，默认为公积金中心转账
                # 公积金贴息为income，需手动修改
                BDM(["公积金"], ["公积金管理中心"], "Assets:Government:HousingFund", [], {}),
            ]
        },
    },
    # common mapping
    # narration,payees,destination,tags,metadata
    # narration 和 payee 都设置，则匹配同时满足关系的bill
    "detail_mappings": [
        # QIQI零钱存入
        BDM(["qiqimick"], ["小宝零花钱"], "Assets:Alipay:LingQian", [], {}),
        # 余额宝收益收入
        BDM(["收益发放"], [], "Income:Investing", [], {}),
    ]
}
```

如前面梳理的账户模型图所示，作为普通的工薪一族，我的日常经济活动和资金流向算是比较简单，现金流入大部分进入招商银行储蓄卡，现金流出通过支付宝和微信作为主要的支付工具，建行仅作为还贷工具，因此只需要导入支付宝账单、微信账单、招行和建行账单即可。

关于**账单导入频次**，我现在选择的是每季度手动导入一次，这个时间兼顾了时效和成本。不使用完全自动化的原因是重复或遗漏的流水需要定期得到确认，目前完全自动化的账单导入并不能很好的完成这一任务。

关于**账单重复**，对于同一条经济活动，支付工具和银行机构都会记录，这就会在账单导入时造成记录的重复，从而导致与实际的偏差，我的方式是：

1. 导入支付宝账单
2. 导入微信账单
3. 导入建行账单
4. 在招行账单导入程序中过滤出支付宝、微信、建行和其他可能存在重复的交易
5. 对于重复的条目不进行直接删除，而是打上“！”标记方便后续校验
6. 同时把收入和支出账户设置为同一个

```
2024-07-01 ! "特约商户" "快捷支付-00000000 支付宝-特约商户" #confirmation-needed #duplicate-alipay
  payment_method: "支付宝"
  Assets:Bank:CMBCHINA:0221  -10000.00 CNY
  Assets:Bank:CMBCHINA:0221
```

### Balance 断言
如此多的交易条目，在记账一段时间后一定会出现与实际的偏差，使用 balance 断言指令可以用于确保某个时刻的账户结余符合实际，系统在结余数字不正确时会报错，这就强制需要对交易流水进行对账操作。经常进行 balance 断言可以帮助账目提高准确性。

配合 pad 指令可以保证随后的 balance 断言必定成立，一般常用 Equity:Opening-Balances 账户作为资产平衡账户，Beancount 会自动计算出差值。其实很好理解，平账的操作本质上就是校准了所有者权益。

```
;;使用pad指令，则随后的balance断言必定成立，差值记录到权益账户
2023-12-31 pad Assets:Alipay:Wallet Equity:Opening-Balances
2024-01-01 balance Assets:Alipay:Wallet  1000.00 CNY
```

### 账本结构与管理
正如前面提到的，有了清晰的账户模型，加上每个 Q 的手动账单导入和结余断言，可以很好的控制账单的准确度，也不会让自己的工作变得繁琐而难以下手，对我而言，这是一个非常好的模式。

这个模式纯粹是个人喜好，基于此，可以设计 Beancount 的工作目录，结构如下

```
├── account
│   ├── accounts.bean
│   ├── balance.bean
│   └── commodities.bean
├── billflow
│   ├── 2024
│   │   ├── balance.bean
│   │   ├── cash.bean
│   │   ├── imports
│   │   │   ├── fullyear.bean
│   │   │   ├── q1.bean
│   │   │   ├── q2.bean
│   │   │   ├── q3.bean
│   │   │   └── q4.bean
│   │   ├── main.bean
│   │   ├── salary.bean
│   │   └── stock.bean
│   ├── 2025
│   │   ├── balance.bean
│   │   ├── cash.bean
│   │   ├── imports
│   │   │   └── fullyear.bean
│   │   ├── main.bean
│   │   ├── salary.bean
│   │   └── stock.bean
│   └── totalbills.bean
├── importers
│   ├── alipay_mobile
│   ├── ccb_debit_card
│   ├── cmb_debit_card
│   └── wechat
├── config.import
├── documents
│   ├── 2024
│   │   ├── q1
│   │   │   ├── alipay_2024_q1.csv
│   │   │   ├── ccb_2024_q1.csv
│   │   │   ├── cmb_2024_q1.pdf
│   │   │   └── wechat_2024_q1.csv
│   │   ├── q2
│   │   │   ├── alipay_2024_q2.csv
│   │   │   ├── ccb_2024_q2.csv
│   │   │   ├── cmb_2024_q2.pdf
│   │   │   └── wechat_2024_q2.csv
│   │   ├── q3
│   │   │   ├── alipay_2024_q3.csv
│   │   │   ├── ccb_2024_q3.csv
│   │   │   ├── cmb_2024_q3.pdf
│   │   │   └── wechat_2024_q3.csv
│   │   └── q4
│   │       ├── alipay_2024_q4.csv
│   │       ├── ccb_2024_q4.csv
│   │       ├── cmb_2024_q4.pdf
│   │       └── wechat_2024_q4.csv
│   └── 2025
│       ├── q1
│       └── q2
├── main.bean
└── temps
    ├── 2024-q1.bean
    ├── 2024-q2.bean
    ├── 2024-q3.bean
    └── 2024-q4.bean
```

这里主要体现一个分门别类，账单源文件按年份和季度存放到 documents 目录，使用 bean-extract 命令将处理后的账单暂存到 temps 以备检查，之后再转移到 billflow

```bash
bean-extract config.import ./documents/2024/q4/ > ./temps/2024-q4.bean
```

最后通过 bean 文件的 include 语句将文件组织到一起，Beancount 有很强的自由度，这也是我比较看重的地方

```
-- main.bean --
* Fava config
1970-01-01 custom "fava-option" "language" "zh_CN"
1970-01-01 custom "fava-option" "auto-reload" "true"

* Beancount config
option "title" "我的家庭总账本" ;总账本用于管理所有账目
option "operating_currency" "CNY" ;主货币
option "operating_currency" "USD" ;美元
option "operating_currency" "HKD" ;港币

include "account/accounts.bean" ;包含账户信息
include "account/commodities.bean" ;包含通货定义和价格变化
include "account/balance.bean" ;包含账目平衡初始化

include "billflow/totalbills.bean" ;引入所有年份的流水和账目平衡断言

-- fava start --
> fava main.bean
```

Beancount 的纯文本特色可以很方便使用 Git 进行版本管理，配合 [NAS Git Server](/blog/2024/03/21/mirror-your-site-using-git-server-and-hooks.html) + [Docker](https://github.com/yegle/fava-docker)，可以完全私有化部署，实现个人专属的财务服务。


