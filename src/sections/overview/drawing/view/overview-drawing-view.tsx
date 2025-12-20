'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { _drawings, _drawingNew, _drawingReview, _drawingsOverview } from 'src/_mock';
import {
  DrawingIllustration,
  CheckInIllustration,
  CheckoutIllustration,
} from 'src/assets/illustrations';

import { DrawingBooked } from '../drawing-booked';
import { DrawingNewest } from '../drawing-newest';
import { DrawingDetails } from '../drawing-details';
import { DrawingAvailable } from '../drawing-available';
import { DrawingStatistics } from '../drawing-statistics';
import { DrawingTotalIncomes } from '../drawing-total-incomes';
import { DrawingWidgetSummary } from '../drawing-widget-summary';
import { DrawingCheckInWidgets } from '../drawing-check-in-widgets';
import { DrawingCustomerReviews } from '../drawing-customer-reviews';

// ----------------------------------------------------------------------

export function OverviewDrawingView() {
  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <DrawingWidgetSummary
            title="Total drawing"
            percent={2.6}
            total={714000}
            icon={<DrawingIllustration />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DrawingWidgetSummary
            title="Sold"
            percent={0.2}
            total={311000}
            icon={<CheckInIllustration />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DrawingWidgetSummary
            title="Canceled"
            percent={-0.1}
            total={124000}
            icon={<CheckoutIllustration />}
          />
        </Grid>

        <Grid container size={12}>
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <Box
              sx={{
                mb: 3,
                p: { md: 1 },
                display: 'flex',
                gap: { xs: 3, md: 1 },
                borderRadius: { md: 2 },
                flexDirection: 'column',
                bgcolor: { md: 'background.neutral' },
              }}
            >
              <Box
                sx={{
                  p: { md: 1 },
                  display: 'grid',
                  gap: { xs: 3, md: 0 },
                  borderRadius: { md: 2 },
                  bgcolor: { md: 'background.paper' },
                  gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
                }}
              >
                <DrawingTotalIncomes
                  title="Total incomes"
                  total={18765}
                  percent={2.6}
                  chart={{
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    series: [{ data: [10, 41, 80, 100, 60, 120, 69, 91, 160] }],
                  }}
                />

                <DrawingBooked
                  title="Booked"
                  data={_drawingsOverview}
                  sx={{ boxShadow: { md: 'none' } }}
                />
              </Box>

              <DrawingCheckInWidgets
                chart={{
                  series: [
                    { label: 'Sold', percent: 73.9, total: 38566 },
                    { label: 'Pending for payment', percent: 45.6, total: 18472 },
                  ],
                }}
                sx={{ boxShadow: { md: 'none' } }}
              />
            </Box>

            <DrawingStatistics
              title="Statistics"
              chart={{
                series: [
                  {
                    name: 'Weekly',
                    categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                    data: [
                      { name: 'Sold', data: [24, 41, 35, 151, 49] },
                      { name: 'Canceled', data: [20, 56, 77, 88, 99] },
                    ],
                  },
                  {
                    name: 'Monthly',
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    data: [
                      { name: 'Sold', data: [83, 112, 119, 88, 103, 112, 114, 108, 93] },
                      { name: 'Canceled', data: [46, 46, 43, 58, 40, 59, 54, 42, 51] },
                    ],
                  },
                  {
                    name: 'Yearly',
                    categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
                    data: [
                      { name: 'Sold', data: [76, 42, 29, 41, 27, 96] },
                      { name: 'Canceled', data: [46, 44, 24, 43, 44, 43] },
                    ],
                  },
                ],
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
              <DrawingAvailable
                title="Tours available"
                chart={{
                  series: [
                    { label: 'Sold out', value: 120 },
                    { label: 'Available', value: 66 },
                  ],
                }}
              />

              <DrawingCustomerReviews
                title="Customer reviews"
                subheader={`${_drawingReview.length} Reviews`}
                list={_drawingReview}
              />
            </Box>
          </Grid>
        </Grid>

        <Grid size={12}>
          <DrawingNewest
            title="Newest drawing"
            subheader={`${_drawingNew.length} drawings`}
            list={_drawingNew}
          />
        </Grid>

        <Grid size={12}>
          <DrawingDetails
            title="Drawing details"
            tableData={_drawings}
            headCells={[
              { id: 'destination', label: 'Destination' },
              { id: 'customer', label: 'Customer' },
              { id: 'checkIn', label: 'Check in' },
              { id: 'checkOut', label: 'Check out' },
              { id: 'status', label: 'Status' },
              { id: '' },
            ]}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
