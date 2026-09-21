import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // A tela de login foi removida. Links e favoritos antigos apontando para
  // /login (inclusive com ?next=) caem direto no dashboard em vez de dar 404.
  // permanent: false (307) de propósito — 308 fica em cache no navegador e
  // atrapalharia caso o login volte um dia.
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
