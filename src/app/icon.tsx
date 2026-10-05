import { brandIconResponse } from "@/lib/brand-icon-image";

export const dynamic = "force-dynamic";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return brandIconResponse(size);
}
