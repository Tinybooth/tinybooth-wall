/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["antd", "@ant-design/nextjs-registry", "@ant-design/icons"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
