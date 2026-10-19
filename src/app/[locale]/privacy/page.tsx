import { SiteFooter } from "@/components/site/site-footer";
import {
  generatePrivacyMetadata,
  PrivacyNotice,
} from "@/features/privacy/privacy-notice";
import { fraunces } from "@/lib/font-design";

export { generatePrivacyMetadata as generateMetadata };

export default async function DesignPrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <div
      data-site-font-root
      className={`${fraunces.variable} flex flex-1 flex-col`}
    >
      <PrivacyNotice params={params} />
      <SiteFooter variant="design" />
    </div>
  );
}
