import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { OgImageTemplate } from "@/lib/og-image";
import { loadOgFonts } from "@/lib/og-fonts";
import { caseStudies, caseStudySlugs } from "@/lib/case-studies";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = caseStudies[slug];
  if (!study) notFound();

  const fonts = await loadOgFonts();
  return new ImageResponse(
    <OgImageTemplate
      label={study.tags[0] ?? "Case Study"}
      title={study.title}
      subtitle={study.subtitle}
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
