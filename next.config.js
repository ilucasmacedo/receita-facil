/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Permite que o build continue mesmo com warnings do ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permite que o build continue mesmo com erros de tipo
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
