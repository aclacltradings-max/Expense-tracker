interface InstallGuideProps {
  /** True for iOS Safari, which uses the Share sheet instead of a prompt. */
  isIos: boolean;
}

/**
 * Manual install instructions for browsers that never fire
 * `beforeinstallprompt` (iOS Safari, desktop Safari, Firefox).
 */
export function InstallGuide({ isIos }: InstallGuideProps) {
  return (
    <div className="space-y-4 text-sm text-slate-600">
      <p>
        This browser does not offer a one-tap install button. You can still add Expense Tracker
        to your home screen or desktop:
      </p>

      {isIos ? (
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Tap the <strong className="font-semibold text-slate-900">Share</strong> button in
            Safari's toolbar.
          </li>
          <li>
            Scroll down and choose{' '}
            <strong className="font-semibold text-slate-900">Add to Home Screen</strong>.
          </li>
          <li>
            Tap <strong className="font-semibold text-slate-900">Add</strong>. The app opens
            full-screen from your home screen.
          </li>
        </ol>
      ) : (
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Open the browser menu (the <strong className="font-semibold text-slate-900">⋮</strong>{' '}
            or <strong className="font-semibold text-slate-900">≡</strong> button).
          </li>
          <li>
            Choose <strong className="font-semibold text-slate-900">Install</strong> or{' '}
            <strong className="font-semibold text-slate-900">Add to Home Screen</strong>.
          </li>
          <li>
            Confirm. The app then launches in its own window, without browser chrome.
          </li>
        </ol>
      )}

      <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Tip: installing requires a secure connection. If the options above are missing, open the
        app over <strong className="font-semibold">HTTPS</strong> or{' '}
        <strong className="font-semibold">localhost</strong> rather than an IP address.
      </p>
    </div>
  );
}
