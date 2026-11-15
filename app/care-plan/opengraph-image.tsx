import { ImageResponse } from "next/og";
import { OgImageTemplate } from "@/lib/og-image";
import { loadOgFonts } from "@/lib/og-fonts";
import { formatCarePrice } from "@/lib/offers";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    <OgImageTemplate label="Monthly plan" title="Care plan" subtitle={`${formatCarePrice()} a month`} />,
    {
      ...size,
      fonts: [
        { name: "SpaceGrotesk", data: fonts.spaceGrotesk, weight: 700 },
        { name: "Inter", data: fonts.inter, weight: 400 },
      ],
    }
  );
}
