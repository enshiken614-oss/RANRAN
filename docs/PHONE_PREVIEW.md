# 只有手机，先预览

使用 GitHub Codespaces 创建一个临时开发空间。它会自动安装依赖并启动网站，不需要在手机上安装 Node.js，也不需要 Vercel Token。

## 手机操作

1. 用 Safari 或 Chrome 打开这个入口：

   https://codespaces.new/enshiken614-oss/RANRAN?quickstart=1

2. 登录你拥有 `RANRAN` 仓库的 GitHub 账号。若页面要求确认，选择创建 Codespace。若不能创建，检查账号是否还有 Codespaces 可用额度。
3. 等待空间创建、安装依赖和启动网站。第一次可能需要几分钟，手机保持页面打开。
4. 网站可能自动打开。如果没有，切到页面底部的 **Ports / 端口** 标签，找到 **3000**，点这一行的 **Open in Browser / 在浏览器中打开**。也可以点启动通知里的 **Open in Browser**。
5. 预览网址通常包含 `-3000.app.github.dev`。只使用页面提供的真实网址，不要自己猜地址。

如果手机屏幕看不到底部面板，可横屏使用，或在浏览器菜单选择“请求桌面网站”。

## 保持私密

Codespaces 转发端口默认是私有的，需要登录 GitHub 账号才能访问。保持 **Private / 私有**，不要改为 Public。这个预览不是 Vercel 的正式发布；当前内容仍是待填写示例。

预览空间会使用 GitHub Codespaces 额度；可能因账号、组织政策、额度或服务限制无法创建。页面要求付费时不要继续，先停止创建。不要把个人密钥写进 GitHub 文件。

## 看完就停止

打开 https://github.com/codespaces ，找到这个项目，点右侧菜单 **… → Stop codespace**。之后可以再次启动同一个空间继续预览，不用重复新建。若不再需要，可以删除空间；浏览器收藏、愿望等本机数据仍取决于对应预览网址。

## 没有自动启动时

在 Codespaces 的 Terminal / 终端里粘贴这一行：

```bash
bash .devcontainer/start-preview.sh
```

如果已有的 Codespace 是在本配置加入前创建的，可以运行 `npm ci`，再运行上面的启动命令。或从 Codespaces 命令面板执行 **Rebuild Container** 以应用配置。
