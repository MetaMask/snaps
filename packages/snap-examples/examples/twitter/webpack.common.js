
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const ImageConfigWebpackPlugin = require('image-config-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        loader: 'swc-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              symbolId: 'icon-[name]',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  output: {
    path: path.join(__dirname, 'dist'),
  },
  plugins: [
    new ImageConfigWebpackPlugin(),
    new HtmlWebPackPlugin({
      template: './src/index.html',
    }),
  ],
};