let loaderUtils = require('loader-utils')
let validate = require('schema-utils')
let fs = require('fs')

function loader (source) {
  this.cacheable(false)
  let options = loaderUtils.getOptions(this)
  let cb = this.async()
  let schema = {
    type: 'object',
    properties: {
      text: {
        type: 'string'
      },
      filename: {
        type: 'string'
      }
    }
  }
  validate(schema, options, 'banner-loader')
  if (options.filename) {
    this.addDependency(options.filename)
    fs.readFile(option.filename, 'utf8', (err, data) => {
      cb(err, `/**${data}*/${source}`)
    })
  }else {
    cb(null, `/**${options.text}*/${source}`)
  }
}
module.exports = loader
