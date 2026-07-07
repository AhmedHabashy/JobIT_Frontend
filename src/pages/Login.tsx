/**
 * Placeholder login screen. Fully built in Phase 3 (US1) from
 * stitch_examples/login.html (signInWithPassword, restricted-signup notice,
 * invalid-vs-deactivated messaging). Kept minimal here so routing compiles.
 */
export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-margin-mobile">
      <div className="w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant rounded-xl p-lg text-center">
        <h1 className="font-headline-md text-headline-md text-on-surface mb-sm">
          Authorized Access Only
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Login form arrives in Phase 3 (US1).
        </p>
      </div>
    </div>
  );
}
