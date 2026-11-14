import { ImageResponse } from "next/og";
import { OgImageTemplate } from "@/lib/og-image";
import { loadOgFonts } from "@/lib/og-fonts";
import { TALK_MINUTES_MAX, TALK_MINUTES_MIN } from "@/lib/offers";
import { TALK_TITLE } from "@/lib/talk";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    <OgImageTemplate
      label="Free talk"
      title={TALK_TITLE}
      subtitle={`Free · ${TALK_MINUTES_MIN}–${TALK_MINUTES_MAX} min · for chambers, SBDCs and business groups`}
    />,
    {
      ...size,
      fonts: [
        { name: "SpaceGrotesk", data: fonts.spaceGrotesk, weight: 700 },
        { name: "Inter", data: fonts.inter, weight: 400 },
      ],
    }
  );
}
