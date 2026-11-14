// Copy for /print-shops. Results and the workflow come from the Print Portal
// case study (caseStudies["print-portal"]), never retyped here. One print shop
// client: say "a print shop", never imply many.
import type { FAQ } from "@/lib/locations";

export const PRINT_SHOP_SOURCE = "print-shops";

export const printShopHero = {
  headline: "Job tickets to invoices, without the paper.",
  subline:
    "For print shop owners whose jobs still live on paper tickets and spreadsheets. I built a production portal for a print shop that now runs every job through it, from quote to QuickBooks.",
};

export const printShopPaths = [
  {
    path: "Configure a packaged print MIS",
    bestFit: "Your workflow matches how the software expects a shop to run.",
    disruption: "High at the start: migrating jobs and customers, and retraining every department.",
    ownership: "The vendor maintains it; you pay the subscription and live with its limits.",
  },
  {
    path: "Connect what you already run",
    bestFit: "The tools mostly work, but people retype the same job between them.",
    disruption: "Low: a small integration, and staff keep the screens they know.",
    ownership: "Small and cheap to keep running, though it breaks when a vendor changes its API.",
  },
  {
    path: "Build custom",
    bestFit: "Your shop works in a way no package fits, and the gap costs you every week.",
    disruption: "Medium: migration and staff adoption, staged one department at a time.",
    ownership: "You own it and it needs maintenance, from me or from another engineer.",
  },
];

export const printShopPathsNote =
  "A packaged MIS is often the right answer. On a call I'll tell you which of the three fits your shop, including when it isn't custom software.";

export const printShopFeatures = [
  "Quotes that become work orders without retyping",
  "Online proof approval, as many rounds as the job needs",
  "A live queue for each department: prepress, press, bindery, shipping",
  "Customers, invoices, and payments synced with QuickBooks",
  "Shipping by FedEx, UPS, USPS, or courier from the same system",
];

export const printShopFaqs: FAQ[] = [
  {
    question: "How long does it take to get off paper?",
    answer:
      "It depends on how many departments and steps your jobs pass through. A discovery call and a written plan come first, so you know the timeline and cost before any build starts.",
  },
  {
    question: "Do we have to switch everything at once?",
    answer:
      "No. Rollout goes one department at a time, so the floor keeps running while each queue moves over.",
  },
  {
    question: "Will it work with QuickBooks?",
    answer:
      "Yes. The print shop portal syncs customers, invoices, and payments with QuickBooks Online in both directions, so nobody re-keys invoices.",
  },
];
