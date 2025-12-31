'use client';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import * as LottoLibrary from 'src/api/lottolibrary';

// ----------------------------------------------------------------------

const LOTTO_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

type LottoPaperProps = {
  title: string;
  selectedNumbers: number[];
  disabledNumbers: number[];
  onToggle: (number: number) => void;
  maxSelection: number;
  color?: string;
};

// 로또 용지 스타일 컴포넌트
function LottoPaper({
  title,
  selectedNumbers,
  disabledNumbers,
  onToggle,
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



  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h4">번호생성</Typography>
        <Stack direction="row" spacing={1}>
             <Button variant="outlined" color="inherit" onClick={handleReset}>
                초기화
             </Button>
            <Button variant="contained" color="primary" onClick={handleGenerate}>
                번호 생성하기
            </Button>
        </Stack>
      </Stack>

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
              maxSelection={39}
              color="#7E91FF"
            />
          </Box>
        </Stack>
      </Box>
      
      {/* 생성 결과 - 최대 5개 세트 */}
      {generatedResults.length > 0 && (
          <Box sx={{ mt: 8, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ mb: 3 }}>생성된 추천 번호</Typography>
              <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ mt: 2 }}>
                {generatedResults.map((result, setIndex) => (
                  <Stack key={setIndex} direction="row" spacing={{ xs: 2, sm: 2, md: 3 }} justifyContent="center" alignItems="center">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        minWidth: { xs: 16, md: 30 }, 
                        fontWeight: 'bold', 
                        color: 'primary.main',
                        fontSize: { xs: '0.75rem', md: '1rem' }
                      }}
                    >
                      {String.fromCharCode(65 + setIndex)}
                    </Typography>
                    {result.map((num) => {
                      const ballColor = LottoLibrary.getBallColor(num);
                      const isIncluded = includedNumbers.includes(num);

                      return (
                        <LottoLibrary.Ball
                          key={num}
                          sx={{
                              flexShrink: 0, // 공이 찌그러지지 않도록 방지
                              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%), ${ballColor}`,
                              // outline 대신 boxShadow를 사용하여 테두리 구현 (겹침 현상 방지)
                              boxShadow: isIncluded 
                                ? `0 0 0 3px white, 0 0 0 6px ${ballColor}, 0 4px 10px rgba(0,0,0,0.3)` 
                                : '0 4px 10px rgba(0,0,0,0.2)',
                              m: isIncluded ? { xs: '4px', md: '6px' } : 0,
                          }}
                        >
                            {num}
                        </LottoLibrary.Ball>
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
