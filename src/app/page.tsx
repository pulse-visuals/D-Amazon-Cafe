import { CinematicHome } from "@/components/cinematic/CinematicHome";

// Rendered fresh on every request so the footer's copyright year (and any
// future request-time personalization) never goes stale between deploys.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return <CinematicHome currentYear={new Date().getFullYear()} />;
}
