let fs = require('fs')
let path = require('path')
// babylon 把源码转换成ast
// @babel/traverse 遍历
// @babel/types 替换
// @babel/generator 生成
let babylon = require('babylon')
let traverse = require('@babel/generator').default
let t = require('@babel/types')
let generator = require('@babel/generator').default
let ejs = require('ejs')

class Compiler {
  constructor (config) {
    this.config = config
    // 需要保存入口文件的路径
    this.entryId
    // 需要保存所有的模块依赖
    this.modules = {}
    this.entry = config.entry
    this.root = process.cwd()
  }
  getSource (modulePath) {
    let content = fs.readFileSync(modulePath, 'utf8')
    return content
  }
  parse (source, parentPath) {
    console.log(source, parentPath)
    let ast = babylon.parse(source)
    let dependencies = []
    traverse(ast, {
      CallExpression(p) {
        let node = p.node
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__'
          let moduleName = node.arguments[0].value
          moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
          moduleName = './' + path.join(parentPath, moduleName)
          dependencies.push(moduleName)
          node.arguments = [t.stringLiteral(moduleName)]
        }
      }
    })
    let sourceCode = generator(ast).code
    return {sourceCode,dependencies}
  }
  // 构建模块
  buildModule (modulePath, isEntry) {
    let source = this.getSource(modulePath)
    let moduleName = './' + path.relative(this.root, modulePath)
    if (isEntry) {
      this.entryId = moduleName
    }
    let {sourceCode, dependencies} = this.parse(source, path.dirname(moduleName))
    this.modules[moduleName] = sourceCode

    dependencies.forEach(dep => {
      this.buildModule(path.join(this.root, dep), false)
    })
  }
  emitFile () {
    let main = path.join(this.config.output.path, this.config.output.filename)
    let templateStr = this.getSource(path.join(__dirname, 'main.ejs'))
    let code = ejs.render(templateStr,{entryId:this.entryId,modules:this.modules})
    this.assets = {}
    this.assets[main] = code
    try{
      fs.writeFileSync(main,this.assets[main],'utf8');
    }catch(e){
      throw new Error(e)
    }
  }
  run () {
    this.buildModule(path.resolve(this.root, this.entry), true)

    this.emitFile()
  }
}

module.exports = Compiler
