import type { Metadata } from "next";
import { LabSection } from "@/components/ui/LabSection";

export const metadata: Metadata = {
  title: "Lab",
  description:
    "Side projects, tools I use every day, and whatever I'm curious about this month.",
  openGraph: {
    url: "https://thehashrocket.com/lab",
  },
};

export default function LabPage() {
  return <LabSection />;
}
