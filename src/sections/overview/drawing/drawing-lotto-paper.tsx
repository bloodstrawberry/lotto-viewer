import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast } from 'src/components/snackbar';

const LOTTO_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

type Props = {
  title: string;
  selectedNumbers: number[];
  disabledNumbers: number[];
  onToggle: (number: number) => void;
  onReset: () => void;
  onAutoSelect: () => void;
  maxSelection: number;
  color?: string;
};

export function DrawingLottoPaper({
  title,
  selectedNumbers,
  disabledNumbers,
  onToggle,
  onReset,
  onAutoSelect,
  maxSelection,
  color = '#FF7575',
}: Props) {
  const mainColor = color;
  const selectedBgColor = color === '#FF7575' ? '#333' : color;

  const PAPER_WIDTH = 220;
  const CELL_WIDTH = 22;
  const CELL_HEIGHT = 23;
  const ROW_GAP = 1.3;
  const COL_GAP = 0.8;
  const FONT_SIZE = '13px';
  const CORNER_LINE = 5;

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
          <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>1,000원</Typography>
        </Box>
      </Box>

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
                    <Typography sx={{ fontWeight: 600, fontSize: FONT_SIZE, color: 'white' }}>
                      {num}
                    </Typography>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        bgcolor: mainColor,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '1px',
                        bgcolor: mainColor,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '1px',
                        height: CORNER_LINE,
                        bgcolor: mainColor,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '1px',
                        height: CORNER_LINE,
                        bgcolor: mainColor,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '1px',
                        height: CORNER_LINE,
                        bgcolor: mainColor,
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '1px',
                        height: CORNER_LINE,
                        bgcolor: mainColor,
                      }}
                    />
                    <Typography
                      sx={{
                        color: mainColor,
                        fontWeight: 500,
                        fontSize: FONT_SIZE,
                      }}
                    >
                      {num}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5, px: 0 }}>
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
                '&:hover': { opacity: 0.7 },
              }}
            >
              <Box
                sx={{
                  width: 4,
                  height: '100%',
                  borderTop: `1px solid ${mainColor}`,
                  borderLeft: `1px solid ${mainColor}`,
                  borderBottom: `1px solid ${mainColor}`,
                }}
              />
              <Typography
                sx={{ px: 0.5, fontSize: '12px', fontWeight: 500, color: mainColor, lineHeight: '20px' }}
              >
                {label}
              </Typography>
              <Box
                sx={{
                  width: 4,
                  height: '100%',
                  borderTop: `1px solid ${mainColor}`,
                  borderRight: `1px solid ${mainColor}`,
                  borderBottom: `1px solid ${mainColor}`,
                }}
              />
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
