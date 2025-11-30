import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';


import { varFade, MotionViewport } from 'src/components/animate';

import * as LottoLibrary from 'src/api/lottolibrary';

// ----------------------------------------------------------------------

export function HomeLottoDisplay() {
  const latestLotto = LottoLibrary.getLatestLottoNumber();

  if (!latestLotto) {
    return null;
  }

  const { numbers, bonus, drwNo, drwNoDate, firstWinamnt, firstPrzwnerCo } = latestLotto;

  return (
    <Container component={MotionViewport} sx={{ py: 10, textAlign: 'center' }}>
      <m.div variants={varFade('inUp')}>
        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 2, md: 3 }}
          justifyContent="center"
          alignItems="center"
          sx={{ mb: 5 }}
        >
          {/* Left Side: Draw No & Date */}
          <Stack alignItems={{ xs: 'flex-end', md: 'flex-start' }} sx={{ minWidth: { xs: 'auto', md: 'auto' } }}>
            <Typography variant="h3" sx={{ color: '#007aff', fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' }, whiteSpace: 'nowrap' }}>
              {drwNo}회
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, whiteSpace: 'nowrap' }}>
              {drwNoDate}
            </Typography>
          </Stack>

          {/* Divider */}
          <Box
            sx={{
              width: '1px',
              height: { xs: '40px', md: '60px' },
              bgcolor: 'divider',
              mx: { xs: 1, md: 2 },
            }}
          />

          {/* Right Side: Win Amount & Count */}
          <Stack alignItems="flex-start">
            <Box
              sx={{
                bgcolor: '#007aff',
                color: 'white',
                px: 1,
                py: 0.5,
                borderRadius: 0.5,
                mb: 0.5,
                display: 'inline-block',
                fontWeight: 'bold',
                fontSize: { xs: '0.75rem', md: '0.875rem' },
              }}
            >
              1등
            </Box>
            <Stack direction="row" alignItems="baseline" spacing={0.5} flexWrap="nowrap">
              <Typography variant="h3" sx={{ color: '#007aff', fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' }, whiteSpace: 'nowrap' }}>
                {new Intl.NumberFormat('ko-KR').format(firstWinamnt)}원
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, whiteSpace: 'nowrap' }}>
                총 {firstPrzwnerCo}게임 당첨
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </m.div>

      <Stack
        direction="row"
        spacing={{ xs: 0.5, sm: 1, md: 3 }}
        justifyContent="center"
        alignItems="center"
        flexWrap="nowrap"
      >
        {numbers.map((num, index) => (
          <m.div key={num} variants={varFade('inUp')} custom={index}>
            <LottoLibrary.Ball
              sx={{
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%), ${LottoLibrary.getBallColor(
                  num
                )}`,
              }}
            >
              {num}
            </LottoLibrary.Ball>
          </m.div>
        ))}

        <m.div variants={varFade('inUp')} custom={6}>
          <Typography variant="h3" sx={{ mx: { xs: 0.5, sm: 1, md: 2 }, fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' }, color: 'text.secondary' }}>
            +
          </Typography>
        </m.div>

        <m.div variants={varFade('inUp')} custom={7}>
          <LottoLibrary.Ball
            sx={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%), ${LottoLibrary.getBallColor(
                bonus
              )}`,
            }}
          >
            {bonus}
          </LottoLibrary.Ball>
        </m.div>
      </Stack>
    </Container>
  );
}
