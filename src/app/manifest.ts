import type { MetadataRoute } from "next";
import { requestSite } from "@/lib/request-site";
import messagesEs from "@/messages/es.json";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await requestSite();
  const isCnc = site === "cnc";
  const color = isCnc ? "#16171A" : "#F3F1EA";

  return {
    name: isCnc ? "CNC by Woodax Design" : "Woodax Design",
    short_name: isCnc ? "Woodax CNC" : "Woodax Design",
    description: isCnc
      ? messagesEs.metadata.cnc.description
      : messagesEs.metadata.design.description,
    start_url: "/",
    display: "standalone",
    background_color: color,
    theme_color: color,
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
