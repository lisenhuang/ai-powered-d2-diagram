import type { NextConfig } from "next";
import withNextIntl from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl("./src/i18n/request.ts")(nextConfig);
