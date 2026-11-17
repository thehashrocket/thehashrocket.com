import { ImageResponse } from "next/og";
import { OgImageTemplate } from "@/lib/og-image";
import { loadOgFonts } from "@/lib/og-fonts";
import { JOB_TITLE } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    <OgImageTemplate
      label={JOB_TITLE}
      title="I build systems that work."
      subtitle="20+ years of engineering complex, high-stakes software."
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
