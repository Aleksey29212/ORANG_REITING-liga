
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  // В Next.js 15 allowedDevOrigins переехал в корень или имеет особенности типизации в экспериментальных опциях
  experimental: {
    // Оставляем здесь, если версия Next.js ожидает его тут, но исправляем предупреждение в логах если оно дублируется
  },
  // Попробуем также разрешить домены для корректной работы Cross-Origin в среде разработки
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
