import type { NextConfig } from "next";
//test
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/videos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp4|webm)$/i,
      use: [{
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/media',
          outputPath: 'static/media',
          name: '[name].[hash].[ext]',
        },
      }],
    });
    return config;
  }
};

export default nextConfig;
