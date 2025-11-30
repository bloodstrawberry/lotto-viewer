import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { OverviewLottoNumberView } from 'src/sections/overview/e-commerce/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `전체통계 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <OverviewLottoNumberView />;
}
