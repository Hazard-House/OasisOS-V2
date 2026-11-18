import { classNames } from '~/utils/classNames';

type OasisMarkTone = 'auto' | 'navy' | 'yellow' | 'white';

const toneClass: Record<OasisMarkTone, string> = {
  auto: 'bg-[#092b49] dark:bg-[#fcd10f]',
  navy: 'bg-[#092b49]',
  yellow: 'bg-[#fcd10f]',
  white: 'bg-white',
};

export function OasisMark({ className, tone = 'auto' }: { className?: string; tone?: OasisMarkTone }) {
  return (
    <span aria-hidden="true" className={classNames('oasis-mark inline-block shrink-0', toneClass[tone], className)} />
  );
}
