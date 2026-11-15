/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // The webpack filesystem cache costs ~700 MB of disk during a build —
  // more than this project's build machine can spare (its home quota is
  // nearly full; see medsetu-data/QBANK-REPORT.md). Memory cache keeps
  // builds working there; on a roomier machine removing this block only
  // makes rebuilds faster.
  webpack: (config) => {
    config.cache = { type: 'memory' };
    return config;
  },
};
module.exports = nextConfig;
