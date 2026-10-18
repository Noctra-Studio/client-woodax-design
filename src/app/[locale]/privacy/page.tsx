import {
  generatePrivacyMetadata,
  PrivacyNotice,
} from "@/features/privacy/privacy-notice";
import { playfair } from "@/lib/font-design";

export { generatePrivacyMetadata as generateMetadata };

export default async function DesignPrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  return (
    <div
      data-site-font-root
      className={`${playfair.variable} flex flex-1 flex-col`}
    >
      <PrivacyNotice params={params} />
    </div>
  );
}
