"use client";

import type { MouseEvent, ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import {
  isPlainLinkClick,
  isPrivacyRoute,
  usePrivacyDialog,
} from "@/features/privacy/privacy-dialog-provider";

export function FooterPrivacyLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { openPrivacy } = usePrivacyDialog();
  const onPrivacyPage = isPrivacyRoute(pathname);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (onPrivacyPage || !isPlainLinkClick(event)) return;
    event.preventDefault();
    openPrivacy(event.currentTarget);
  }

  return (
    <Link href="/privacy" className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
