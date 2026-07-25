/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Supabase Storage public URLs — replace <project-ref> once you have
    // your project, or widen this if you rename buckets later.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
