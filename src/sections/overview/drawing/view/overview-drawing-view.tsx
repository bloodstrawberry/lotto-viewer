'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { getIsMobile } from 'src/utils/is-mobile';
import * as LottoLibrary from 'src/api/lottolibrary';

// ----------------------------------------------------------------------

const LOTTO_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

type LottoPaperProps = {
  title: string;
  selectedNumbers: number[];
  disabledNumbers: number[];
  onToggle: (number: number) => void;
  onReset: () => void;
  onAutoSelect: () => void;
  maxSelection: number;
  color?: string;
};

// 로또 용지 스타일 컴포넌트
function LottoPaper({
  title,
  selectedNumbers,
  disabledNumbers,
  onToggle,
  onReset,
  onAutoSelect,
  maxSelection,
  color = '#FF7575',
}: LottoPaperProps) {
  const mainColor = color; 
  const selectedBgColor = color === '#FF7575' ? '#333' : color; // 제외수는 테마색 그대로, 포함수는 강조를 위해 진한색 유지 또는 테마색 사용 가능

  // ========== 조절 변수 (여기서 조절하세요!) ==========
  const PAPER_WIDTH = 220;      // 용지 전체 너비 (px)
  const CELL_WIDTH = 22;        // 셀 너비 (px)
  const CELL_HEIGHT = 23;       // 셀 높이 (px)
  const ROW_GAP = 1.3;          // 행 간격 (세로 방향 간격)
  const COL_GAP = 0.8;          // 열 간격 (가로 방향 간격)
  const FONT_SIZE = '13px';     // 숫자 폰트 크기
  const CORNER_LINE = 5;        // 모서리 세로선 길이 (px)
  // ====================================================

  return (
    <Box
      sx={{
        width: PAPER_WIDTH, 
        border: `1px solid ${mainColor}`,
        bgcolor: '#fff',
        position: 'relative',
        mx: 'auto',
        fontFamily: "'Roboto Mono', monospace",
        userSelect: 'none',
        borderRadius: '4px',
      }}
    >
      {/* 헤더 */}
      <Box sx={{ height: 36, position: 'relative', borderBottom: `1px solid ${mainColor}` }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '25%',
            height: '100%',
            borderRight: `1px solid ${mainColor}`,
            bgcolor: 'white',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '75%',
            height: '100%',
            bgcolor: mainColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>
            1,000원
          </Typography>
        </Box>
      </Box>

      {/* 번호 영역 */}
      <Box sx={{ py: 1.5, px: 1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            rowGap: ROW_GAP,
            columnGap: COL_GAP,
          }}
        >
          {LOTTO_NUMBERS.map((num) => {
            const isSelected = selectedNumbers.includes(num);
            const isDisabled = disabledNumbers.includes(num);

            return (
              <Box
                key={num}
                onClick={() => !isDisabled && onToggle(num)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.3 : 1,
                  position: 'relative',
                  width: CELL_WIDTH,
                  height: CELL_HEIGHT,
                  transition: 'all 0.15s ease',
                }}
              >
                 {isSelected ? (
                    // 선택된 숫자: 검은색 배경 + 흰색 글자
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            bgcolor: selectedBgColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                         <Typography sx={{ fontWeight: 600, fontSize: FONT_SIZE, color: 'white' }}>{num}</Typography>
                    </Box>
                 ) : (
                    // 선택되지 않은 숫자: 양옆이 뚫린 대괄호 형태
                    <Box sx={{ 
                        width: '100%', 
                        height: '100%', 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                    }}>
                        {/* 위쪽 가로선 */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            bgcolor: mainColor,
                        }} />
                        
                        {/* 아래쪽 가로선 */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '1px',
                            bgcolor: mainColor,
                        }} />
                        
                        {/* 왼쪽 위 모서리 세로선 */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '1px',
                            height: CORNER_LINE,
                            bgcolor: mainColor,
                        }} />
                        
                        {/* 왼쪽 아래 모서리 세로선 */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '1px',
                            height: CORNER_LINE,
                            bgcolor: mainColor,
                        }} />
                        
                        {/* 오른쪽 위 모서리 세로선 */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '1px',
                            height: CORNER_LINE,
                            bgcolor: mainColor,
                        }} />
                        
                        {/* 오른쪽 아래 모서리 세로선 */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '1px',
                            height: CORNER_LINE,
                            bgcolor: mainColor,
                        }} />
                        
                        {/* Number */}
                        <Typography sx={{
                            color: mainColor,
                            fontWeight: 500,
                            fontSize: FONT_SIZE,
                        }}>
                            {num}
                        </Typography>
                    </Box>
                 )}
              </Box>
            );
          })}
        </Box>

        {/* 하단 버튼 영역 */}
        <Stack 
            direction="row" 
            justifyContent="space-between" 
            sx={{ 
                mt: 1.5, 
                px: 0,
            }}
        >
            {['초기화', '자동선택', '나의번호등록'].map((label) => (
             <Box 
                key={label}
                onClick={() => {
                  if (label === '초기화') {
                    onReset();
                  } else if (label === '자동선택') {
                    onAutoSelect();
                  } else {
                    toast.warning('지원하지 않는 기능입니다.');
                  }
                }}
                sx={{ 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    height: 20,
                    '&:hover': { opacity: 0.7 }
                }}
            >
                {/* Left Bracket [ */}
                <Box sx={{ 
                    width: 4, 
                    height: '100%', 
                    borderTop: `1px solid ${mainColor}`,
                    borderLeft: `1px solid ${mainColor}`,
                    borderBottom: `1px solid ${mainColor}`,
                }} />
                <Typography sx={{ px: 0.5, fontSize: '12px', fontWeight: 500, color: mainColor, lineHeight: '20px' }}>{label}</Typography>
                {/* Right Bracket ] */}
                <Box sx={{ 
                    width: 4, 
                    height: '100%', 
                    borderTop: `1px solid ${mainColor}`,
                    borderRight: `1px solid ${mainColor}`,
                    borderBottom: `1px solid ${mainColor}`,
                }} />
             </Box>
           ))}
        </Stack>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export function OverviewDrawingView() {
  const [includedNumbers, setIncludedNumbers] = useState<number[]>([]);
  const [excludedNumbers, setExcludedNumbers] = useState<number[]>([]);
  const [generatedResults, setGeneratedResults] = useState<number[][]>([]);

  // 포함수 토글
  const handleToggleIncluded = useCallback(
    (num: number) => {
      if (excludedNumbers.includes(num)) return;
      setIncludedNumbers((prev) => {
        if (prev.includes(num)) return prev.filter((n) => n !== num);
        if (prev.length >= 6) return prev;
        return [...prev, num].sort((a, b) => a - b);
      });
    },
    [excludedNumbers]
  );

  // 제외수 토글
  const handleToggleExcluded = useCallback(
    (num: number) => {
      if (includedNumbers.includes(num)) return;
      setExcludedNumbers((prev) => {
        if (prev.includes(num)) return prev.filter((n) => n !== num);
        if (prev.length >= 39) return prev; 
        return [...prev, num].sort((a, b) => a - b);
      });
    },
    [includedNumbers]
  );

  // 생성 로직 - 최대 5개 세트 생성 (중복 조합 제외)
  const handleGenerate = () => {
    const resultsSet = new Set<string>();
    const needed = 6 - includedNumbers.length;

    if (needed < 0) { alert("포함수가 6개를 초과했습니다."); return; }
    
    const availablePool = LOTTO_NUMBERS.filter((n) => !excludedNumbers.includes(n) && !includedNumbers.includes(n));

    if (availablePool.length < needed) { alert("선택 가능한 숫자가 부족합니다."); return; }

    // 최대 100번 시도하여 유니크한 5개 세트 찾기 (보통 5번이면 충분)
    let attempts = 0;
    while (resultsSet.size < 5 && attempts < 100) {
      const result = [...includedNumbers];
      let pool = [...availablePool];

      for (let i = 0; i < needed; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        result.push(pool[randomIndex]);
        pool.splice(randomIndex, 1); 
      }
      
      const sortedSet = result.sort((a, b) => a - b);
      resultsSet.add(JSON.stringify(sortedSet));
      attempts++;
    }
    
    setGeneratedResults(Array.from(resultsSet).map(s => JSON.parse(s)));
  };

  const handleReset = () => {
      setIncludedNumbers([]);
      setExcludedNumbers([]);
      setGeneratedResults([]);
  }

  const handleAutoSelect = useCallback((type: 'included' | 'excluded') => {
    toast.info(`${type === 'included' ? '포함수' : '제외수'} 3개를 자동으로 선택합니다.`);
    
    const shuffledPool = [...LOTTO_NUMBERS]
      .filter((n) => (type === 'included' ? !excludedNumbers.includes(n) : !includedNumbers.includes(n)))
      .sort(() => 0.5 - Math.random());
      
    const selected = shuffledPool.slice(0, 3).sort((a, b) => a - b);
    
    if (type === 'included') {
      setIncludedNumbers(selected);
    } else {
      setExcludedNumbers(selected);
    }
  }, [includedNumbers, excludedNumbers]);

  const handleShare = useCallback(async () => {
    const latest = LottoLibrary.getLatestLottoNumber();
    if (!latest || generatedResults.length === 0) return;

    const nextDrwNo = latest.drwNo + 1;
    const nextDate = new Date(latest.drwNoDate);
    nextDate.setDate(nextDate.getDate() + 7);

    const year = nextDate.getFullYear();
    const month = nextDate.getMonth() + 1;
    const day = nextDate.getDate();

    const formattedResults = generatedResults
      .map((result, index) => {
        const label = String.fromCharCode(65 + index);
        const numbers = result
          .sort((a, b) => a - b)
          .map((n) => n.toString().padStart(2, '0'))
          .join(', ');
        return `${label} : ${numbers}`;
      })
      .join('\n');

    const shareText = `[${nextDrwNo}]회 (${year}년 ${month}월 ${day}일 추첨)

${formattedResults}

https://lotto-viewer.vercel.app/`;

    const isMobile = getIsMobile();

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: '추천 로또 번호',
          text: shareText,
        });
        return;
      } catch (error) {
        console.warn('Share cancelled or failed:', error);
      }
    }

    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('추천 로또 번호가 복사되었습니다!');
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      toast.error('복사에 실패했습니다.');
    }
  }, [generatedResults]);



  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          position: 'sticky',
          top: { xs: 80, md: 100 },
          zIndex: 1100,
          display: 'flex',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            p: 1.5,
            px: 2.5,
            borderRadius: '24px',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.z24,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(8px)',
            backgroundColor: (theme) => `rgba(255, 255, 255, 0.8)`,
          }}
        >
          <Button 
            variant="outlined" 
            color="inherit" 
            onClick={handleReset}
            sx={{ borderRadius: '12px' }}
          >
            초기화
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGenerate}
            sx={{ borderRadius: '12px', px: 3 }}
          >
            번호 생성
          </Button>
        </Stack>
      </Box>

      {/* 상단 여백 보정 (버튼이 사라진 자리) */}
      <Box sx={{ mb: { xs: 2, md: 4 } }} />

      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pb: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 1, md: 4 }}
          sx={{
            transform: { xs: 'scale(0.8)', sm: 'scale(0.9)', md: 'scale(1)' },
            transformOrigin: 'top center',
            // 스케일링 후 남는 여백 문제를 해결하기 위해 축소된 만큼 실제 공간을 보정
            width: { xs: 'calc(100% / 0.8)', sm: 'calc(100% / 0.9)', md: '100%' },
            maxWidth: { xs: 450, sm: 500, md: '100%' },
            justifyContent: 'center',
          }}
        >
          {/* 왼쪽: 포함수 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                textAlign: 'center', 
                mb: 1, 
                color: 'text.secondary', 
                fontSize: { xs: '0.85rem', md: '1rem' }, 
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}
            >
              반드시 포함할 숫자
            </Typography>
            <LottoPaper
              title="포함수"
              selectedNumbers={includedNumbers}
              disabledNumbers={excludedNumbers}
              onToggle={handleToggleIncluded}
              onReset={() => setIncludedNumbers([])}
              onAutoSelect={() => handleAutoSelect('included')}
              maxSelection={6}
              color="#FF7575"
            />
          </Box>

          {/* 오른쪽: 제외수 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                textAlign: 'center', 
                mb: 1, 
                color: 'text.secondary', 
                fontSize: { xs: '0.85rem', md: '1rem' }, 
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}
            >
              절대 나오면 안되는 숫자
            </Typography>
            <LottoPaper
              title="제외수"
              selectedNumbers={excludedNumbers}
              disabledNumbers={includedNumbers}
              onToggle={handleToggleExcluded}
              onReset={() => setExcludedNumbers([])}
              onAutoSelect={() => handleAutoSelect('excluded')}
              maxSelection={39}
              color="#7E91FF"
            />
          </Box>
        </Stack>
      </Box>
      
      {/* 생성 결과 - 최대 5개 세트 */}
      {generatedResults.length > 0 && (
          <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Stack 
                  direction="row" 
                  alignItems="center" 
                  justifyContent="center" 
                  spacing={1} 
                  sx={{ mb: 3 }}
                >
                  <Typography variant="h5">생성된 추천 번호</Typography>
                  <Tooltip title="공유하기">
                    <IconButton onClick={handleShare}>
                      <Iconify icon="mdi:share-variant" width={24} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ mt: 2 }}>
                {generatedResults.map((result, setIndex) => (
                  <Stack key={setIndex} direction="row" spacing={0} justifyContent="center" alignItems="center">
                    {/* 행 레이블 (A, B, C...) - 홈 화면 스타일과 맞추기 위해 너비 최적화 */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        minWidth: { xs: 20, md: 40 }, 
                        textAlign: 'left',
                        fontWeight: 'bold', 
                        color: 'primary.main',
                        fontSize: { xs: '0.75rem', md: '1rem' }
                      }}
                    >
                      {String.fromCharCode(65 + setIndex)}
                    </Typography>

                    {/* 공 목록 - home-view의 spacing과 테두리 두께를 반영한 그리드 너비 */}
                    {result.map((num) => {
                      const ballColor = LottoLibrary.getBallColor(num);
                      const isIncluded = includedNumbers.includes(num);

                      return (
                        <Box 
                          key={num} 
                          sx={{ 
                            // home-view 간격을 기준으로 테두리 유동 공간 확보
                            width: { xs: 48, sm: 72, md: 104 }, 
                            height: { xs: 48, sm: 72, md: 104 }, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <LottoLibrary.Ball
                            sx={{
                                flexShrink: 0,
                                background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%), ${ballColor}`,
                                // 화면 크기별로 테두리 두께를 조절하여 home-view의 간격 느낌 구현
                                boxShadow: isIncluded 
                                  ? {
                                      xs: `0 0 0 2px white, 0 0 0 4px ${ballColor}, 0 2px 5px rgba(0,0,0,0.3)`, 
                                      md: `0 0 0 3px white, 0 0 0 6px ${ballColor}, 0 4px 10px rgba(0,0,0,0.3)`
                                    }
                                  : '0 4px 10px rgba(0,0,0,0.2)',
                                transition: 'all 0.2s ease',
                            }}
                          >
                              {num}
                          </LottoLibrary.Ball>
                        </Box>
                      );
                    })}
                  </Stack>
                ))}
              </Stack>
              <Typography variant="caption" sx={{ mt: 3, display: 'block', color: 'text.secondary' }}>
                * 테두리가 있는 공은 사용자가 지정한 포함수입니다.
              </Typography>
          </Box>
      )}
    </DashboardContent>
  );
}
