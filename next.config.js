/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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
};

module.exports = nextConfig;
