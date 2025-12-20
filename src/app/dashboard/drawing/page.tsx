import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { OverviewDrawingView } from 'src/sections/overview/drawing/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `TEST | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <OverviewDrawingView />;
}
