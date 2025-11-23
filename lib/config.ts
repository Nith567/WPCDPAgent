export const CDP_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? "",
  ethereum: {
    // if you want to create an EVM account on login
    createOnLogin: "smart", // or "smart" for smart accounts
  },
  appName: "WPAgent",
};

export const APP_CONFIG = {
  name: "WPAgent",
  logoUrl: "/x402-icon-blue.png",
};
