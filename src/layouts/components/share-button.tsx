'use client';

import { useState, useCallback } from 'react';

import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';

import { Iconify } from 'src/components/iconify';
import { getLatestLottoNumber } from 'src/api/lottolibrary';

// ----------------------------------------------------------------------

export function ShareButton() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const generateShareText = useCallback(() => {
    const latest = getLatestLottoNumber();
    if (!latest) return '';

    const numbers = latest.numbers.join(', ');
    // Formatting numbers with commas
    const totSellamnt = new Intl.NumberFormat('ko-KR').format(latest.totSellamnt);
    const firstWinamnt = new Intl.NumberFormat('ko-KR').format(latest.firstWinamnt);
    
    const [year, month, day] = latest.drwNoDate.split('-');
    const formattedDate = `${year}년 ${month}월 ${day}일`;

    // Construct the message matching the user's requested format
    return `${latest.drwNo}회(${formattedDate} 추첨)

번호 : ${numbers}
보너스 번호 : ${latest.bonus}

총 판매금액 : ${totSellamnt}원
1등 당첨금액 : ${firstWinamnt}원
1등 당첨자 : ${latest.firstPrzwnerCo}명
https://lotto-viewer.vercel.app/`;
  }, []);

  const handleShare = async () => {
    const shareText = generateShareText();
    if (!shareText) {
        setSnackbarMessage('데이터를 불러올 수 없습니다.');
        setOpenSnackbar(true);
        return;
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile && navigator.share) {
      // Mobile / Web Share API supported
      try {
        await navigator.share({
          title: '로또 당첨 결과',
          text: shareText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard (Web/Desktop)
      try {
        await navigator.clipboard.writeText(shareText);
        setSnackbarMessage('최신 1등 로또 정보가 복사되었습니다!');
        setOpenSnackbar(true);
      } catch (err) {
        console.error('Failed to copy: ', err);
        setSnackbarMessage('복사에 실패했습니다.');
        setOpenSnackbar(true);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Tooltip title="공유하기">
        <IconButton
          onClick={handleShare}
          sx={{
            width: 40,
            height: 40,
          }}
        >
          <Iconify icon="mdi:share-variant" width={24} />
        </IconButton>
      </Tooltip>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackbar}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        autoHideDuration={2000}
      />
    </>
  );
}
