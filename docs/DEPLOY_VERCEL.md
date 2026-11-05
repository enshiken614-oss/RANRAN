# 部署到 Vercel

项目已通过生产构建，Vercel 会自动识别为 Next.js。不需要安装数据库，也不需要修改构建命令。

## 在你的 Vercel 账户发布

1. 打开 https://vercel.com/new ，登录自己的账户。
2. 在 Import Git Repository 中连接 GitHub，选择 `enshiken614-oss/RANRAN`。若看不到仓库，在 GitHub 授权设置中允许 Vercel 访问它。
3. Framework Preset 使用 `Next.js`，Root Directory 保持根目录，生产分支选择 `main`。
4. 展开 Environment Variables，添加下面两个变量，至少应用到 Production；若使用 Preview，也要为 Preview 配置。

| 变量名                    | 你需要填写的内容                                   |
| ------------------------- | -------------------------------------------------- |
| `UNIVERSE_ACCESS_CODE`    | 你们专用的长口令，至少 8 个字符                    |
| `UNIVERSE_SESSION_SECRET` | 随机密钥，至少 32 个字符，不能使用可猜测的示例文字 |

密钥可以在自己的终端生成：

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

只把密钥填入 Vercel 的环境变量设置，不要写进源代码或发送到聊天。口令与密钥都不要加 `NEXT_PUBLIC_` 前缀。没有有效凭据时，线上内容会保持锁定。

5. 点击 Deploy，等待状态变为 Ready，打开生成的 `https://…vercel.app` 地址。
6. 使用无痕窗口检查：先看到口令入口，错误口令不能进入，正确口令能进入星系。然后在手机上打开同一地址检查。

正式地址确定后，可以在 Settings → Environment Variables 添加可选的 `UNIVERSE_SITE_URL`，值为完整来源地址，例如 `https://你的域名`，不带路径。修改环境变量后要重新部署。绑定自己的域名时，按 Vercel 显示的 DNS 记录设置，并相应更新该变量。

## 照片和后续更新

当前只有原创示例画作与待填写文字，没有真实私人资料。填写真实资料前，先确认 GitHub 仓库为私有。网站口令不能保护公开 GitHub 源代码里的情书。

真实媒体放在 `private-media/`，通过 `/api/media/文件名` 访问；该目录默认不提交。仅在确认是私有仓库后，才选择性加入需要部署的素材。服务端函数已经配置媒体文件追踪，实际进入构建的文件会随受保护接口打包。大型媒体建议改用私有对象存储。

以后修改 `src/config/ourStory.ts` 并提交到 GitHub 的 `main` 分支，连接成功的 Vercel 项目会自动重新构建。收藏、愿望和草稿仍只保存在当前浏览器，不会因部署自动实现同步。

## 由云环境代为部署的前提

若继续让助手通过 CLI 发布，云环境需要可用的 Vercel 账户授权，以及访问 `api.vercel.com`、`vercel.com` 和部署域名 `*.vercel.app` 的网络权限。当前会话已将这三个域名增补保存到环境配置草稿；需在环境设置中审阅、保存并发布云环境后才会生效。这与在 Vercel 点击 Deploy 是两个不同操作。

不要在聊天里发送 Vercel Token。可以在受支持的安全设置中提供授权，或直接使用上面的 Vercel 网页导入流程。
