# 新闻爬虫

## 版本管理

### 多点同步

该项目分别保存在个人电脑中和个人服务器上，此外还托管在 Gitee 和 GitHub 上。

通过 Git 的同步操作，个人电脑、个人服务器和 Gitee 上的版本很容易保持一致，但由于网络原因，向 GitHub 服务器的推送常常失败，不必强求。平常注意前三者的一致性，有空了在个人电脑上用 GitHub Desktop 向 GitHub 推送新版本。

### GUI 操作

VSCode 集成了 Git 功能，可以以鼠标点击的方式 Push 和 Pull 新版本。

### 精简同步

利用 .gitignore 文件，对 puppeteer 这个 headless browser 不同步，SQlite 数据库为二进制文件，也不同步，否则 .git/ 文件夹会膨胀得非常恐怖。



## 数据保存

### 冗余备份

1. ./scripts/ 文件夹中的 JSON 文件
2. ./database/ 文件夹中的 sqlite3 数据库文件
3. 本地和服务器上的 MongoDB 数据库（服务器上的数据库相对不安全，又被黑客入侵的危险）

## 定时运行

利用服务器永不关机的优势，定时运行爬虫脚本。