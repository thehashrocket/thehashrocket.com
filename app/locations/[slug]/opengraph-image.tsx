import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getLocation, locationSlugs } from "@/lib/locations";

export const alt = "Jason Shultz — Software Engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locationSlugs.map((slug) => ({ slug }));
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) {
    return new ImageResponse(<div>Not found</div>, { ...size });
  }

  const fontsDir = join(process.cwd(), "public", "fonts");
  const [spaceGroteskData, interData] = await Promise.all([
    readFile(join(fontsDir, "SpaceGrotesk-Bold.ttf")),
    readFile(join(fontsDir, "Inter-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            color: "#4ade80",
            fontSize: 24,
            fontFamily: "Inter",
            marginBottom: 16,
          }}
        >
          {location.region}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#fafafa",
            fontSize: 72,
            fontFamily: "Space Grotesk",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            marginBottom: 24,
          }}
        >
          <span>Software Engineering</span>
          <span>in {location.name}</span>
        </div>
        <div
          style={{
            color: "#a1a1a1",
            fontSize: 28,
            fontFamily: "Inter",
            maxWidth: 700,
          }}
        >
          Jason Shultz — Senior Full-Stack Engineer
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            color: "#808080",
            fontSize: 20,
            fontFamily: "Inter",
          }}
        >
          thehashrocket.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: spaceGroteskData,
          weight: 700,
          style: "normal",
        },
        {
          name: "Inter",
          data: interData,
          weight: 400,
          style: "normal",
        },
      ],
    },
  );
}
