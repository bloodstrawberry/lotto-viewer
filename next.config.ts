import type { NextConfig } from 'next';

// ----------------------------------------------------------------------

const isStaticExport = true;

const nextConfig: NextConfig = {
  basePath: '/lotto-viewer', // GitHub Pages 서브 경로
  assetPrefix: '/lotto-viewer/', // 끝에 '/' 추가
  trailingSlash: true,
  output: isStaticExport ? 'export' : undefined,
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
};

export default nextConfig;
