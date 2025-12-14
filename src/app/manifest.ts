import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Between - Instant Reflex Game',
    short_name: 'Between',
    description: '声で遊ぶ、数字の「間」を答える瞬間反射ゲーム',
    start_url: '/',
    display: 'standalone', // ブラウザのURLバーを消してアプリっぽく見せる設定
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/apple-icon.png', // 先ほど作成したPNG画像を流用
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.svg', // SVG対応ブラウザ用
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}