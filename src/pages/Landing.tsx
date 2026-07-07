import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

/**
 * Placeholder public landing page. Fully built in Phase 9 (US7) from
 * stitch_examples/landing.html. Kept minimal here so routing/guards compile.
 */
export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-md px-margin-mobile text-center">
      <span className="font-headline-md text-headline-md text-primary">Jobit</span>
      <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg max-w-2xl">
        Navigate the Egyptian Job Market with AI
      </h1>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">
        Expert career guidance based on your CV and real-time labour data. Access is provided by
        your administrator.
      </p>
      <Link to="/login">
        <Button>Sign In</Button>
      </Link>
    </div>
  );
}
