import React, { memo, useState } from "react";
import Box from "@mui/material/Box";
import { ThemeType, getCellColorByTheme } from "src/api/lottolibrary";
import { LottoCell } from "./lotto-cell";
import { getConsecutiveColors } from "../utils";

const LOTTO_NUMBERS = Array.from({ length: 45 }, (_, i) => i + 1);

type DataRowProps = {
  round: any;
  showBonus: boolean;
  showNumbers: boolean;
  showDivider: boolean;
  theme: ThemeType;
  showMissing: boolean;
  missingStreakMap?: Record<number, number>;
  showConsecutive: boolean;
  consecutiveMap?: Record<number, Set<number>>;
};

export const DataRow = memo(function DataRow({
  round,
  showBonus,
  showNumbers,
  showDivider,
  theme,
  showMissing,
  missingStreakMap,
  showConsecutive,
  consecutiveMap,
}: DataRowProps) {
  const [clicked, setClicked] = useState<number[]>([]);

  const handleClick = (num: number, isWinning: boolean) => {
    if (!isWinning) return;

    if (clicked.includes(num)) {
      setClicked(clicked.filter((n)=>n !== num));
    } else {
      setClicked([...clicked, num]);
    }
  };

  return (
    <div style={{ display:"flex", alignItems:"center" }}>
      <Box
        sx={{
          width:"40px",
          fontSize:"10px",
          textAlign:"right",
          marginRight:"6px",
          color:"#999",
          fontFamily:"monospace",
          display:{ xs:"none", sm:"block" },
        }}
      >
        {round.drwNo}
      </Box>

      <div style={{ flex:1, display:"flex", gap:"1px" }}>
        {LOTTO_NUMBERS.map((num)=>{
          const isWinning = round.numbers.includes(num);
          const isBonus = showBonus && round.bonus === num;
          const isClicked = clicked.includes(num);

          const bgColor = getCellColorByTheme(theme, num, isWinning, isBonus, isClicked);
          const shouldShowDivider = showDivider && num % 5 === 0 && num !== 45;
          const shouldShowNumber = showNumbers || isClicked;

          // 미출현 오버레이 계산
          const streak = (showMissing && missingStreakMap) ? (missingStreakMap[num] || 0) : 0;
          let overlayColor = 'transparent';
          if (streak > 0 && !isWinning) {
             const alpha = Math.min(streak * 2.5, 95) / 100;
             overlayColor = `rgba(0,0,0, ${alpha})`;
          }

          return (
            <LottoCell
              key={num}
              num={num}
              bgColor={bgColor}
              textColor="#fff" // Optimized logic: Always whites if shown
              content={shouldShowNumber ? num : ""}
              showDivider={shouldShowDivider}
              overlayColor={overlayColor}
              onClick={() => handleClick(num, isWinning)}
              cursor={isWinning ? "pointer" : "default"}
              consecutiveColors={showConsecutive ? getConsecutiveColors(consecutiveMap?.[num]) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
});
