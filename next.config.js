/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Desabilita completamente o ESLint durante o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Permite que o build continue mesmo com erros de tipo
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
