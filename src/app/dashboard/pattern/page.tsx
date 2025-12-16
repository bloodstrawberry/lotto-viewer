import type { Metadata } from 'next';

import { OverviewLottoNumberView } from 'src/sections/overview/pattern/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `Lotto Viewer | 패턴분석` };

export default function Page() {
  return <OverviewLottoNumberView />;
}
