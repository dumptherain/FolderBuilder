const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    })
    // Allow importing raw text presets
    config.module.rules.push({
      test: /\.preset\.txt$/i,
      type: 'asset/source',
    })
    return config
  },
}

export default nextConfig
