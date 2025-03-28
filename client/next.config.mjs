/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    output: "standalone",
    reactStrictMode: false,
};

export default nextConfig;
