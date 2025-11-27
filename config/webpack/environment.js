const { environment } = require('@rails/webpacker')
const webpack = require('webpack');

environment.plugins.append(
  'Environment',
  new webpack.EnvironmentPlugin(
    JSON.parse(JSON.stringify(process.env))
  )
)

module.exports = environment
