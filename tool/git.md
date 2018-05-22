# git撤销本地修改与回退版本

1. 使用 git checkout 撤销本地修改

即放弃对本地已修改但尚未提交的文件的修改，还原其到未修改前的状态。
注意： 已 add/ commit 的文件不适用个方法，应该用本文提到的第二种方法。

命令如下：
```bash
git checkout .      # 撤销对所有已修改但未提交的文件的修改，但不包括新增的文件
git checkout [filename]     # 撤销对指定文件的修改，[filename]为文件名

git checkout ./components/base/nav/nav-top.vue   # 撤销nav-top.vue 的本地修改
```

2. 使用 git reset 回退项目版本

可以回退到任意已经提交过的版本。已 add / commit 但未 push 的文件也适用。

命令如下：
```bash
git reset --hard [commit-hashcode]
# [commit-hashcode]是某个 commit 的哈希值，可以用 git log 查看

#取消已经暂存的文件。即，撤销先前"git add"的操作
git reset HEAD <file>...

#修改最后一次提交。用于修改上一次的提交信息，或漏提交文件等情况。
git commit --amend

#回退所有内容到上一个版本
git reset HEAD^

#回退a.py这个文件的版本到上一个版本  
git reset HEAD^ a.py  

#向前回退到第3个版本  
git reset –soft HEAD~3  

#将本地的状态回退到和远程的一样  
git reset –hard origin/master  

#回退到某个版本  
git reset 057d  

#回退到上一次提交的状态，按照某一次的commit完全反向的进行一次commit.(代码回滚到上个版本，并提交git) 慎用
git revert HEAD
```
因此一般用法是先用 git log 查看具体commit的哈希值，然后 reset 到那个版本。
