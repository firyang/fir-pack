## 创建项目
```javascript
  yarn init -y
```
## 配置全局脚本命令
- 在bin目录下新建 fir-pack.js
- package.json 添加以下代码
```javascript
  "bin": {
    "fir-pack": "./bin/fir-pack.js"
  }
```
- 执行 npm link 将命令映射到全局
```javascript
  npm link
```
- 在项目中执行 npm link fir-pack , 即可在项目中使用 npx fix-pack 命令执行全局脚本 fir-pack.js
```javascript
  npm link fir-pack
```
