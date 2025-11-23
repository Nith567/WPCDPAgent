import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    RESOURCE_WALLET_ADDRESS: process.env.RESOURCE_WALLET_ADDRESS,
    NEXT_PUBLIC_FACILITATOR_URL: process.env.NEXT_PUBLIC_FACILITATOR_URL,
  },
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Exclude problematic Zora SDK that's not needed
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@zoralabs/coins-sdk": "commonjs @zoralabs/coins-sdk",
      });
    }

    // Ignore Zora SDK imports
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias["@zoralabs/coins-sdk"] = false;

    return config;
  },
};

export default nextConfig;
