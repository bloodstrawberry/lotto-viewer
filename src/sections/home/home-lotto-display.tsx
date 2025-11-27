import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

import { varFade, MotionViewport } from 'src/components/animate';

// ----------------------------------------------------------------------

const NUMBERS = [1, 20, 31, 41, 44, 45];
const BONUS_NUMBER = 7;

const getBallColor = (num: number) => {
  if (num <= 10) return '#fbc400';
  if (num <= 20) return '#69c8f2';
  if (num <= 30) return '#ff7272';
  if (num <= 40) return '#aaaaaa';
  return '#b0d840';
};

const Ball = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '2rem',
  boxShadow: theme.shadows[10],
  position: 'relative',
  textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
  border: '2px solid rgba(255,255,255,0.2)',
}));

// ----------------------------------------------------------------------

export function HomeLottoDisplay() {
  return (
    <Container component={MotionViewport} sx={{ py: 10, textAlign: 'center' }}>
      <m.div variants={varFade('inUp')}>
        <Typography variant="h2" sx={{ mb: 5 }}>
          Latest Lotto Results
        </Typography>
      </m.div>

      <Stack
        direction="row"
        spacing={{ xs: 1, md: 3 }}
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
      >
        {NUMBERS.map((num, index) => (
          <m.div key={num} variants={varFade('inUp')} custom={index}>
            <Ball
              sx={{
                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%), ${getBallColor(
                  num
                )}`,
              }}
            >
              {num}
            </Ball>
          </m.div>
        ))}

        <m.div variants={varFade('inUp')} custom={6}>
          <Typography variant="h3" sx={{ mx: 2, color: 'text.secondary' }}>
            +
          </Typography>
        </m.div>

        <m.div variants={varFade('inUp')} custom={7}>
          <Ball
            sx={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%), ${getBallColor(
                BONUS_NUMBER
              )}`,
            }}
          >
            {BONUS_NUMBER}
          </Ball>
        </m.div>
      </Stack>
    </Container>
  );
}
