const { withContentlayer } = require('next-contentlayer')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate'
      })
    }

    config.resolve.alias.canvas = false

    return config
  },
  async redirects() {
    return [
      {
        source: '/banner',
        destination: '/paper',
        permanent: true
      }
    ]
  }
}

module.exports = withContentlayer(nextConfig)
