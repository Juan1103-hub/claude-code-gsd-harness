import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Bíblia Sagrada",
    short_name: "Bíblia",
    description:
      "Leia a Bíblia Sagrada gratuitamente, offline e com conforto — múltiplas traduções, modo noturno e recursos de estudo.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    // Cores do design system (app/globals.css): papel escuro do modo noturno.
    background_color: "#211d17",
    theme_color: "#211d17",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
