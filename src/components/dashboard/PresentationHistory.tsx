import { Link } from '@tanstack/react-router';
import { PresentationListSection } from '#/features/presentations';

interface PresentationHistoryProps {
  presentations: any[];
  isPending: boolean;
}

export function PresentationHistory({ presentations, isPending }: PresentationHistoryProps) {
  return (
    <div className="mb-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-primaryText tracking-tight">Recent Presentations</h3>
          <p className="text-secondaryText text-sm mt-1">Your generated workspace history.</p>
        </div>
      </div>

      <div className="sf-fade-in is-visible">
        <PresentationListSection presentations={presentations} isPending={isPending} />
      </div>
    </div>
  );
}
