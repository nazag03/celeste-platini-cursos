import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  
  
  
  
  
  
  experimental: {
    serverActions: {
      
      
      bodySizeLimit: "40mb",
    },
  },
  images: {
    
    
    
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  
  
  
  async redirects() {
    const removed = [
      "/tortas-y-pasteleria",
      "/boxes",
      "/eventos",
      "/galeria",
      "/pedido-personalizado",
      "/presupuesto-evento",
      "/recetarios",
    ];
    return removed.flatMap((path) => [
      { source: path, destination: "/cursos-online", permanent: false },
      { source: `${path}/:rest*`, destination: "/cursos-online", permanent: false },
    ]);
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
