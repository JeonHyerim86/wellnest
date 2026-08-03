import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // 기본 1MB 제한에 걸려 일반적인 폰 사진(2~4MB)이 서버 액션에 도달하기도 전에
      // 413으로 잘린다. lib/storage.ts 의 MAX_IMAGE_BYTES(5MB)보다 여유를 둔다.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
