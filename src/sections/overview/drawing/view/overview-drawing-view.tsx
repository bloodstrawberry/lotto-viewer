'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';

import { useLottoGenerator } from '../use-lotto-generator';
import { DrawingLottoPaper } from '../drawing-lotto-paper';
import { DrawingGeneratedResults } from '../drawing-generated-results';

// ----------------------------------------------------------------------

export function OverviewDrawingView() {
  const {
    includedNumbers,
    excludedNumbers,
    generatedResults,
    setIncludedNumbers,
    setExcludedNumbers,
    handleToggleIncluded,
    handleToggleExcluded,
    handleGenerate,
    handleReset,
    handleAutoSelect,
    handleShare,
  } = useLottoGenerator();

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
                whiteSpace: 'nowrap',
              }}
            >
              반드시 포함할 숫자
            </Typography>
            <DrawingLottoPaper
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
                whiteSpace: 'nowrap',
              }}
            >
              절대 나오면 안되는 숫자
            </Typography>
            <DrawingLottoPaper
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

      <DrawingGeneratedResults
        results={generatedResults}
        includedNumbers={includedNumbers}
        onShare={handleShare}
      />
    </DashboardContent>
  );
}
