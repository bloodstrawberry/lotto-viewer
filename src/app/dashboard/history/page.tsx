import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { OverviewHistoryView } from 'src/sections/overview/history/view';
 
 // ----------------------------------------------------------------------
 
 export const metadata: Metadata = { title: `History | Dashboard - ${CONFIG.appName}` };
 
 export default function Page() {
   return <OverviewHistoryView />;
 }
