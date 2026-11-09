/** @type {import('next').NextConfig} */
const nextConfig = {
  // Répertoire de build surchargeable par l'environnement.
  //
  // `next build` efface le répertoire de sortie avant d'écrire : construire dans
  // `.next` pendant que `next start` tourne supprime les chunks que le process
  // en cours référence encore, et le site renvoie des HTTP 400 sur
  // `_next/static/chunks/app/*.js` jusqu'au redémarrage (incident du
  // 2026-11-09). `scripts/deploy.sh` construit donc dans `.next-build` puis
  // bascule le répertoire d'un `mv`, ce qui réduit l'indisponibilité à la seule
  // durée du redémarrage du service.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.cjkamenge.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "www.api.cjkamenge.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "api.cjk.com",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "www.api.cjk.com",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "10.34.146.127",
        port: "8000",
        pathname: "/media/**",
      },
    ],
  },
};

module.exports = nextConfig;
