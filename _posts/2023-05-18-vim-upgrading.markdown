---
layout: post
title: vim 插件管理和配置升级
category: developer
tags:
    - vim
    - coc
    - ack
---

因为使用 vscode vim 模式较多的缘故，有很长一段时间冷落了 vim 本体。然而近期工作中深感 vscode 占用内存过多，又想起 vim 的好。于是工欲善其事必先利其器，经过一番插件梳理和配置更新，完成了全新 vim 的更替，主要包括：

1. 使用 [vim-plug](https://github.com/junegunn/vim-plug) 替换 vundle 管理插件
2. 引入 [coc.vim](https://github.com/neoclide/coc.nvim) 支持 typescript 智能补全等高级功能
3. 引入 [ack.vim](https://github.com/mileszs/ack.vim)，支持全局搜索
4. 优化配置文件，确保 mvim gui 与 terminal 中表现一致

### 插件管理

替换了原来的 vundle 插件系统，精简插件列表，只保留必须的。这里为了体验 code copilot 也引入了 [openai](https://github.com/madox2/vim-ai) 插件。
```vimscript
" Plug Mode
call plug#begin()
" The default plugin directory will be as follows:
"   - Vim (Linux/macOS): '~/.vim/plugged'
"   - Vim (Windows): '~/vimfiles/plugged'
"   - Neovim (Linux/macOS/Windows): stdpath('data') . '/plugged'
" You can specify a custom plugin directory by passing it as the argument
"   - e.g. `call plug#begin('~/.vim/plugged')`
"   - Avoid using standard Vim directory names like 'plugin'

"editor addons
Plug 'Lokaltog/powerline', {'rtp': 'powerline/bindings/vim/'} "statusline
Plug 'scrooloose/nerdtree'
Plug 'scrooloose/nerdcommenter'
Plug 'Lokaltog/vim-easymotion'
Plug 'mileszs/ack.vim'
Plug 'kien/ctrlp.vim'
Plug 'neoclide/coc.nvim', {'branch': 'release'}
Plug 'yegappan/mru'
Plug 'airblade/vim-rooter'

"code addons
Plug 'pangloss/vim-javascript'
Plug 'leafgarland/typescript-vim'
Plug 'maxmellon/vim-jsx-pretty'
Plug 'ap/vim-css-color'
Plug 'cakebaker/scss-syntax.vim'
Plug 'rakr/vim-one'

"labs
" ./install.sh script will automatically install openai-python
Plug 'madox2/vim-ai', { 'do': './install.sh' }

call plug#end()
```

### 配置
参照各插件的配置文档进行基本问题不会太大，COC 会稍微复杂些，启动以下 features
```vimscript
" CoC extensions
let g:coc_global_extensions = ['coc-tsserver', 'coc-json', 'coc-snippets', 'coc-pairs', 'coc-prettier']
```

配置文件分成三部分
```vimscript
" Common settings here
" Custom configuration, see plugin/settings/Settings.vim.
" 1) ./vimrc
" 2) ./plugin/settings/Settings.vim
" 3) ./gvimrc
```

key mapping 快捷命令，使用不频繁总是会忘记，:map 命令可以用，这里也记录下
```vimscript
"=======================
" custom settings here
" key mapping guide
" basic:
"   j: move down
"   k: move up
"   kj: esc
"   gj: PageDown
"   gk: PageUp
"   gu: JumpUp
"   gi: JumpDown
"   nt,gt: Next Tab
"   nT,gT: Pre Tab
"   ctrl-w(h\j\k\l): window change
"   0: goto line start
"   g ctrl+g: count words
"   zf: create code fold
"   zm/zc: close fold
"   zo/zr: open fold
"   zd/zD: remove fold
"
" advance:
"   tab: indent
"   ,dd: NERDTreeFind
"   ,mr: MRU
"   ,s: ack keyword search
"   ,a: open ack
"   ,cc: comment
"   ,cu: uncomment
"   ctrl-p: ctrlp search filename
"   ctrl-j: coc goto definition
"   dg: diagnostic next
"   gd: diagnostic prev
"   K: ShowDocumentation
"   ,as: coc actions
"   ,qf: coc quickfix
"   ,re: coc refactor
"=======================
```

### 重复使用

See [使用说明](https://github.com/nunumick/vim/tree/master#usage)
