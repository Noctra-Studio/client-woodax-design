import { llmsTxt } from "@/lib/llms-txt";
import { requestSite } from "@/lib/request-site";

export const dynamic = "force-dynamic";

export async function GET() {
  const site = await requestSite();
  return new Response(llmsTxt(site), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
