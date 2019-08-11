#! /usr/bin/env node

let path = require('path')

// config配置文件
let config = require(path.resolve('webpack.config.js'))

let Compiler = require('../lib/Compiler.js')
let compiler = new Compiler(config)

// 标识运行编译
compiler.run()
