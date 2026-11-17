import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { OasisMark } from '~/components/ui/OasisMark';

interface DocumentationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function DocumentationPanel({ open, onClose }: DocumentationPanelProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-md transition-opacity data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-[1001] flex w-full flex-col border-l border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 text-bolt-elements-textPrimary shadow-2xl outline-none sm:inset-y-3 sm:right-3 sm:w-[min(480px,75vw)] sm:rounded-xl sm:border">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-bolt-elements-borderColor px-5 sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <OasisMark className="h-10 w-10" />
              <Dialog.Title className="truncate text-sm font-semibold">About OasisOS</Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close about"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-bolt-elements-textSecondary transition-colors hover:bg-bolt-elements-background-depth-2 hover:text-bolt-elements-textPrimary"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </header>
          <div className="flex flex-1 flex-col gap-4 px-7 py-8 text-sm leading-6 text-bolt-elements-textSecondary">
            <p>OasisOS builds web apps in the browser.</p>
            <p>You need an AI provider key before a prompt can write code.</p>
            <p>Add one under Settings, then pick a model in the composer.</p>
            <p className="text-xs text-bolt-elements-textTertiary">Based on bolt.diy.</p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
