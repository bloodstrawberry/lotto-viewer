import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import lottoNumber from 'json/lottoNumber.json';

export type LottoRound = {
  totSellamnt: number;
  returnValue: string;
  drwNoDate: string;
  firstWinamnt: number;
  drwtNo6: number;
  drwtNo4: number;
  drwtNo5: number;
  bnusNo: number;
  firstAccumamnt: number;
  drwNo: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo1: number;
  firstPrzwnerCo: number;
};

export const Ball = styled(Box)(({ theme }) => ({
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
  [theme.breakpoints.down('md')]: {
    width: 60,
    height: 60,
    fontSize: '1.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    width: 36,
    height: 36,
    fontSize: '0.875rem',
  },
}));

export const getBallColor = (num: number) => {
  if (num <= 10) return '#fbc400';
  if (num <= 20) return '#69c8f2';
  if (num <= 30) return '#ff7272';
  if (num <= 40) return '#aaaaaa';
  return '#b0d840';
};

export const getLength = () => {
    return lottoNumber.length;
}

export const getLatestLottoNumber = () => {
  if (!lottoNumber || lottoNumber.length === 0) {
    return null;
  }

  const latest = lottoNumber[lottoNumber.length - 1];

  return {
    ...latest,
    numbers: [latest.drwtNo1, latest.drwtNo2, latest.drwtNo3, latest.drwtNo4, latest.drwtNo5, latest.drwtNo6],
    bonus: latest.bnusNo
  };
};