/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const path = require('path');

const debug = process.env.NODE_ENV === 'development';
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

let rules = [
  {
    test: /\.(t|j)sx?$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [['@babel/preset-react', {targets: 'defaults'}]],
      },
    },
  },
  {
    test: /\.html$/,
    use: [
      {
        loader: 'html-loader',
        options: {minimize: true},
      },
    ],
  },
  {
    test: /\.svg$/,
    use: ['@svgr/webpack', 'url-loader'],
    type: 'javascript/auto',
  },
  {
    test: /\.(png|jpg|gif)$/,
    type: 'asset/resource',
    generator: {
      filename: 'images/[name].[ext]',
    },
  },
  {
    test: /\.eot(\?v=\d+.\d+.\d+)?$/,
    type: 'asset/resource',
    generator: {
      filename: 'fonts/[name].[ext]',
    },
  },
  {
    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
    type: 'asset/resource',
    generator: {
      filename: 'fonts/[name].[ext]',
    },
  },
  {
    test: /\.less$/,
    use: ['style-loader', 'css-loader', 'less-loader'],
  },
  {
    test: /\.[ot]tf(\?v=\d+.\d+.\d+)?$/,
    type: 'asset/resource',
    generator: {
      filename: 'fonts/[name].[ext]',
    },
  },
];
const plugins = [
  new CleanWebpackPlugin(),
  new webpack.IgnorePlugin(/^\.\/locale$/),
  new webpack.IgnorePlugin(/\/iconv-loader$/),

  new MiniCssExtractPlugin({
    filename: 'assets/a[contenthash:7].css',
    chunkFilename: 'assets/v[id][contenthash:6].css',
  }),
  new HtmlWebPackPlugin({
    template: './public/index.html',
    filename: './index.html',
  }),
  new webpack.DefinePlugin({
    'process.env.MOCK_BROWSER': JSON.stringify(process.env.MOCK_BROWSER),
  }),
];
if (debug) {
  // development
  rules = rules.concat([
    {
      test: /\.(sa|sc|c)ss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
    },
  ]);

  // plugins
  plugins.push(new webpack.HotModuleReplacementPlugin());
} else {
  rules = rules.concat([
    {
      test: /\.(sa|sc|c)ss$/,
      use: [
        'style-loader',
        {
          loader: MiniCssExtractPlugin.loader,
        },
        {
          loader: 'css-loader',
        },
        'sass-loader',
      ],
    },
  ]);
}

const devServer = {
  contentBase: './dist',
  https: true,
  compress: true,
  historyApiFallback: true,
  hot: true,
  host: '0.0.0.0',
  port: '8080',
  writeToDisk: true,
};

const exporting = {
  entry: './src/index.js',
  output: {
    path: `${__dirname}/dist`,
    publicPath: '/',
    filename: debug ? 'assets/[name].[contenthash].js' : 'assets/[name].[chunkhash].js',
    hotUpdateChunkFilename: 'hot/hot-update.js',
    hotUpdateMainFilename: 'hot/hot-update.json',
  },
  devServer,
  module: {
    rules,
  },
  resolve: {
    modules: [path.resolve('./src'), path.resolve('./node_modules')],
    extensions: ['.css', '.less', '.scss', '.js', '.json', '.svg', '.jsx'],
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
  plugins,
  optimization: {
    splitChunks: {
      cacheGroups: {
        extractToSingleStyle: {
          test: (m) => m.constructor.name === 'CssModule',
          name: 'other-styles',
          chunks: 'all',
          enforce: false,
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    minimize: true,
    minimizer: [new CssMinimizerPlugin()],
  },
  devtool: debug ? 'eval-cheap-module-source-map' : 'source-map',
  stats: 'minimal',
};

module.exports = exporting;
