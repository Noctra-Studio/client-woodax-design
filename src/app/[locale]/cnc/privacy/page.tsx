import { SiteFooter } from "@/components/site/site-footer";
import {
  generatePrivacyMetadata,
  PrivacyNotice,
} from "@/features/privacy/privacy-notice";

export { generatePrivacyMetadata as generateMetadata };

export default async function CncPrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <>
      <PrivacyNotice params={params} />
      <SiteFooter variant="cnc" />
    </>
  );
}
