const path = require('path');
const { HotModuleReplacementPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

// const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
// const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const config = (_env, { mode }) => {
  const devMode = mode !== 'production';

  const cssModuleOpts = {
    sourceMap: true,
    modules: {
      mode: 'local',
      localIdentName: devMode ? '[local]--[hash:base64:5]' : '[hash:base64]',
    },
  };

  const base = {
    devtool: 'source-map',
    entry: `./src/index.tsx`,
    output: {
      publicPath: '/',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', 'jsx', '.css', '.scss'],
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: 'public/index.html',
      }),
      new ESLintPlugin({
        context: './src',
        extensions: ['js', 'jsx', 'ts', 'tsx'],
      }),
      new MiniCssExtractPlugin({
        filename: 'style.css',
      }),
    ],
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/i,
          include: path.join(__dirname, 'src'),
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            // options: {
            //   babelrc: false,
            //   configFile: path.resolve(__dirname, '.babelrc.js'),
            // },
          },
        },
        {
          test: /module\.(scss|css)$/,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-modules-typescript-loader',
            {
              loader: 'css-loader',
              options: cssModuleOpts,
            },
            'sass-loader',
          ],
        },
        {
          test: /\.(scss|css)$/,
          exclude: /module\.(scss|css)$/,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: /\.(jpe?g|png|gif|ico)$/i,
          use: [
            'file-loader?hash=sha512&digest=hex&name=css/[name]-[hash].[ext]',
          ],
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                native: false,
              },
            },
          ],
        },
        {
          test: /\.(eot|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
          use: ['file-loader?name=fonts/[name].[ext]'],
        },
        { test: /\.md$/, loader: 'ignore-loader' },
      ],
    },
    devServer: {
      static: path.join(__dirname, 'public'),
      historyApiFallback: true,
      port: 3000,
      open: true,
      hot: true,
      // proxy: {
      //   '/api': {
      //     target: 'http://0.0.0.0:4000',
      //     secure: false,
      //     changeOrigin: true,
      //     pathRewrite: { '/api': '' },
      //     // headers: {
      //     //   Connection: 'keep-alive',
      //     // },
      //     // router(req) {
      //     //   console.log('Proxying', req.url);
      //     //   return `http://localhost:4000`;
      //     // },
      //     logLevel: 'debug',
      //   },
      // },
    },
  };

  devMode && base.plugins.push(new HotModuleReplacementPlugin());

  return base;
};

module.exports = config;
