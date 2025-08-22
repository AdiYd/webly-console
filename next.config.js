/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add GOOGLE IMAGES REMOTE PATTERNS
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Add transpilePackages to include problematic packages
  transpilePackages: ['undici', '@firebase/auth', 'firebase'],

  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    // Fix for modern syntax in dependencies
    config.module.rules.push({
      test: /\.js$/,
      include: [/node_modules\/undici/, /node_modules\/@firebase\/auth/, /node_modules\/firebase/],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-private-methods',
            '@babel/plugin-proposal-private-property-in-object',
          ],
        },
      },
    });

    // Add resolve.alias to help with package resolution conflicts
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: require.resolve('undici'),
    };

    return config;
  },
  env: {
    FIREBASE_ADMIN_SDK: Buffer.from(process.env.FIREBASE_ADMIN_SDK_BASE64, 'base64').toString(
      'utf-8'
    ),
  },
};

module.exports = nextConfig;
