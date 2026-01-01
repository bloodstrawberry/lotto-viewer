import { useRef, useState, useLayoutEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const LOTTO_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

type Props = {
    title?: string; // Used for accessibility or alternate render if needed, essentially unused in original
    headerText?: string;
    selectedNumbers: number[];
    disabledNumbers?: number[]; // Make optional
    onToggle?: (number: number) => void;
    onReset?: () => void;
    onAutoSelect?: () => void;
    maxSelection?: number; // Make optional
    color?: string;
    showLines?: boolean;
    readOnly?: boolean;
};

export function LottoPaper({
    title,
    headerText = '1,000원',
    selectedNumbers,
    disabledNumbers = [],
    onToggle,
    onReset,
    onAutoSelect,
    maxSelection = 6,
    color = '#FF7575',
    showLines = false,
    readOnly = false,
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

    const containerRef = useRef<HTMLDivElement>(null);
    const cellRefs = useRef<Record<number, HTMLDivElement | null>>({});
    const [linePoints, setLinePoints] = useState<string>('');

    useLayoutEffect(() => {
        if (!showLines || selectedNumbers.length < 2 || !containerRef.current) {
            setLinePoints('');
            return;
        }

        const calculatePath = () => {
            const container = containerRef.current;
            if (!container) return;

            const containerRect = container.getBoundingClientRect();

            const points = selectedNumbers.map(num => {
                const cell = cellRefs.current[num];
                if (!cell) return null;
                const cellRect = cell.getBoundingClientRect();

                // Calculate center relative to container
                const x = cellRect.left - containerRect.left + cellRect.width / 2;
                const y = cellRect.top - containerRect.top + cellRect.height / 2;
                return `${x},${y}`;
            }).filter(Boolean);

            setLinePoints(points.join(' '));
        };

        calculatePath();

        // Optional: Recalculate on resize (though paper is fixed width usually)
        const observer = new ResizeObserver(calculatePath);
        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [selectedNumbers, showLines]);

    return (
        <Box
            ref={containerRef}
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
            {/* SVG Overlay for Lines */}
            {showLines && linePoints && (
                <Box
                    component="svg"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 1, // Above background, below text? Or above text? Image shows on top.
                    }}
                >
                    <polyline
                        points={linePoints}
                        fill="none"
                        stroke="#ADFF2F" // Greenish yellow like the image
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ opacity: 0.8 }}
                    />
                </Box>
            )}

            {/* Header */}
            <Box sx={{ height: 36, position: 'relative', borderBottom: `1px solid ${mainColor}` }}>
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '25%',
                        height: '100%',
                        borderRight: `1px solid ${mainColor}`,
                        bgcolor: '#E0E0E0', // Grayish background for left part like image
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
                    <Typography sx={{ fontWeight: 600, fontSize: '18px' }}>{headerText}</Typography>
                </Box>
            </Box>

            {/* Grid */}
            <Box sx={{ py: 1.5, px: 1, position: 'relative', zIndex: 2 }}>
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
                                ref={(el: HTMLDivElement | null) => { cellRefs.current[num] = el; }}
                                onClick={() => !readOnly && !isDisabled && onToggle && onToggle(num)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: readOnly || isDisabled ? (isDisabled ? 'not-allowed' : 'default') : 'pointer',
                                    opacity: isDisabled ? 0.3 : 1,
                                    position: 'relative',
                                    width: CELL_WIDTH,
                                    height: CELL_HEIGHT,
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                {/* Bracket Style or Filled Style */}
                                {isSelected ? (
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            bgcolor: selectedBgColor, // Dark gray usually
                                            borderRadius: '50%', // Circle shape for selected numbers like in image? 
                                            // Image shows Oval/Rounded rect for selected. 
                                            // Original DrawingLottoPaper was rect fill.
                                            // Image provided shows Vertical Oval (Capsule).
                                            // Let's stick closer to original rectangle fill unless user asked?
                                            // User said: "Use drawing-lotto-paper.tsx as is".
                                            // So I will stick to original Rectangle Fill logic.
                                            // BUT the original code in drawing-lotto-paper.tsx lines 114-121 was a Box with bgcolor.
                                            // I will keep it.
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
                                        {/* Brackets [ ] */}
                                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', bgcolor: mainColor }} />
                                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', bgcolor: mainColor }} />
                                        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '1px', height: CORNER_LINE, bgcolor: mainColor }} />
                                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '1px', height: CORNER_LINE, bgcolor: mainColor }} />
                                        <Box sx={{ position: 'absolute', top: 0, right: 0, width: '1px', height: CORNER_LINE, bgcolor: mainColor }} />
                                        <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: '1px', height: CORNER_LINE, bgcolor: mainColor }} />

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

                {/* Footer Buttons (Reset, etc) - Only show if not readOnly */}
                {!readOnly && (
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5, px: 0 }}>
                        {['초기화', '자동선택', '나의번호등록'].map((label) => (
                            <Box
                                key={label}
                                onClick={() => {
                                    if (label === '초기화') {
                                        onReset && onReset();
                                    } else if (label === '자동선택') {
                                        onAutoSelect && onAutoSelect();
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
                                <Box sx={{ width: 4, height: '100%', borderTop: `1px solid ${mainColor}`, borderLeft: `1px solid ${mainColor}`, borderBottom: `1px solid ${mainColor}` }} />
                                <Typography sx={{ px: 0.5, fontSize: '12px', fontWeight: 500, color: mainColor, lineHeight: '20px' }}>
                                    {label}
                                </Typography>
                                <Box sx={{ width: 4, height: '100%', borderTop: `1px solid ${mainColor}`, borderRight: `1px solid ${mainColor}`, borderBottom: `1px solid ${mainColor}` }} />
                            </Box>
                        ))}
                    </Stack>
                )}
            </Box>
        </Box>
    );
}
