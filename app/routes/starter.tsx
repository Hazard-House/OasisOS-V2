import type { MetaFunction } from 'react-router';
import { ClientOnly } from 'remix-utils/client-only';
import { StarterTemplateImport } from '~/components/chat/StarterTemplateImport.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';
import { LoadingOverlay } from '~/components/ui/LoadingOverlay';
import { oasisMeta } from '~/lib/oasisMeta';

export const meta: MetaFunction = () => oasisMeta('Start a blank app | OasisOS');

export default function Starter() {
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <ClientOnly fallback={<LoadingOverlay message="Loading starter template..." />}>
        {() => <StarterTemplateImport />}
      </ClientOnly>
    </div>
  );
}
