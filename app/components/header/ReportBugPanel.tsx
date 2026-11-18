import * as Dialog from '@radix-ui/react-dialog';
import { Bug, X } from 'lucide-react';

interface ReportBugPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ReportBugPanel({ open, onClose }: ReportBugPanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-md transition-opacity data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[1001] flex w-full flex-col border-l border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary shadow-2xl outline-none sm:inset-y-3 sm:right-3 sm:w-[min(720px,75vw)] sm:rounded-xl sm:border">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-bolt-elements-borderColor px-5 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bolt-elements-background-depth-3 text-bolt-elements-item-contentAccent">
                <Bug className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <Dialog.Title className="truncate text-sm font-semibold">Report a bug</Dialog.Title>
                <Dialog.Description className="truncate text-xs text-bolt-elements-textSecondary">
                  Tell your team what broke.
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close bug report"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-bolt-elements-textSecondary transition-colors hover:bg-bolt-elements-background-depth-2 hover:text-bolt-elements-textPrimary"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </header>

          <div className="flex flex-1 flex-col items-start justify-center px-8 py-12 sm:px-14">
            <p className="mb-2 text-lg font-semibold">Found something that is not working?</p>
            <p className="max-w-lg text-sm leading-6 text-bolt-elements-textSecondary">
              This build does not send reports to an outside site. Share the details with the person who runs OasisOS.
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
