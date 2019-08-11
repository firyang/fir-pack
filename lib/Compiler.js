let path = require('path')
let fs = require('fs')
// 转换成 ast
let babylon = require('babylon')
// 遍历
let traverse = require('@babel/traverse').default
// 替换
let t = require('@babel/types')
// 生成
let generator = require('@babel/generator').default
let ejs = require('ejs')

class Compiler {
  constructor (config) {
    this.config = config
    this.entryId
    this.modules = {}
    this.entry = config.entry
    this.root = process.cwd()
  }
  getSource (modulePath) {
    return fs.readFileSync(modulePath, 'utf8')
  }
  parse (source, parentPath) {
    let dependencies = []
    let ast = babylon.parse(source)
    traverse(ast, {
      CallExpression(p) {
        let node = p.node
        let moduleName
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__'
          moduleName = node.arguments[0].value
          moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
          moduleName = './' + path.join(parentPath, moduleName).replace(/\\/g, '/')
          dependencies.push(moduleName)
          node.arguments = [t.stringLiteral(moduleName)]
        }
      }
    })
    let sourceCode = generator(ast).code
    return { sourceCode, dependencies}
  }
  buildModule (modulePath, isEntry) {
    let source = this.getSource(modulePath) // F:\workspace\webpack-dev\src\index.js true
    let moduleId = './' + path.relative(this.root, modulePath).replace(/\\/g, '/') // src/index.js
    let parentPath = path.dirname(moduleId) // ./src
    if (isEntry) {
      this.entryId = moduleId
    }
    let {sourceCode, dependencies} = this.parse(source, parentPath)
    this.modules[moduleId] = sourceCode
    dependencies.forEach(dep => {
      this.buildModule(path.join(this.root, dep), false)
    })
  }
  emitFile () {
    let outputPath = this.config.output.path
    let filename = this.config.output.filename
    let templateStr = this.getSource(path.join(__dirname, 'main.ejs'))
    let code = ejs.render(templateStr,{entryId:this.entryId,modules:this.modules})
    fs.writeFileSync(path.join(outputPath,filename),code)
  }
  run () {
    this.buildModule(path.join(this.root, this.entry), true)
    this.emitFile()
  }
}

module.exports = Compiler
