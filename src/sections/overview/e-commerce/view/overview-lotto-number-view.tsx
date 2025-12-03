'use client';

import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import ButtonGroup from "@mui/material/ButtonGroup";

import { DashboardContent } from "src/layouts/dashboard";
import { getAllLottoNumbers, ThemeType, THEME_NAMES, getCellColorByTheme, getPredictCellColor } from "src/api/lottolibrary";

// ----------------------------------------------------------------------

export function OverviewLottoNumberView() {
  const [data, setData] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(30);
  const [showBonus, setShowBonus] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  // ⭐ 숫자 보기 토글 (ON → 숫자 전체 보임)
  const [showNumbers, setShowNumbers] = useState(true);
  
  // ⭐ 구분선 보기 토글 (ON → 5의 배수마다 구분선 표시)
  const [showDivider, setShowDivider] = useState(true);

  // ⭐ 테마 선택
  const [theme, setTheme] = useState<ThemeType>('default');

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  useEffect(() => {
    const allData = getAllLottoNumbers();
    const sortedDesc = [...allData].sort((a, b) => b.drwNo - a.drwNo);
    setData(sortedDesc);
    setVisibleCount(30);
  }, []);

  const displayed = (() => {
    const slice = data.slice(0, visibleCount);
    return isReversed ? [...slice].reverse() : slice;
  })();

  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < 6) {
      setSelectedNumbers([...selectedNumbers, num].sort((a,b)=>a-b));
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Card>
        <CardHeader
          title="Pattern"
          sx={{ mb: 2 }}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {/* 테마 선택 버튼 그룹 */}
              <ButtonGroup variant="outlined" size="small">
                {(Object.keys(THEME_NAMES) as ThemeType[]).map((themeKey) => (
                  <Button
                    key={themeKey}
                    onClick={() => setTheme(themeKey)}
                    variant={theme === themeKey ? 'contained' : 'outlined'}
                    sx={{
                      minWidth: '70px',
                      fontWeight: theme === themeKey ? 'bold' : 'normal',
                    }}
                  >
                    {THEME_NAMES[themeKey]}
                  </Button>
                ))}
              </ButtonGroup>

              <FormControlLabel
                control={
                  <Switch
                    checked={showNumbers}
                    onChange={(e) => setShowNumbers(e.target.checked)}
                  />
                }
                label="숫자"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={showBonus}
                    onChange={(e) => setShowBonus(e.target.checked)}
                  />
                }
                label="보너스 번호"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={showDivider}
                    onChange={(e) => setShowDivider(e.target.checked)}
                  />
                }
                label="구분선"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={isReversed}
                    onChange={(e) => setIsReversed(e.target.checked)}
                  />
                }
                label="역순"
              />
            </Box>
          }
        />
        <Box sx={{ p: 2 }}>
          {isReversed && (
            <Box sx={{ display:"flex", justifyContent:"center", mb:1 }}>
              <Button
                variant="soft"
                color="inherit"
                onClick={() => setVisibleCount((prev)=>Math.min(prev+30, data.length))}
                disabled={visibleCount >= data.length}
                sx={{ minWidth:40 }}
              >
                ↑
              </Button>
            </Box>
          )}

          <Box sx={{ overflowX: "auto", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", minWidth: "600px" }}>
              {!isReversed && (
                <PredictRow
                  selectedNumbers={selectedNumbers}
                  handleNumberClick={handleNumberClick}
                  showNumbers={showNumbers}
                  showDivider={showDivider}
                  theme={theme}
                />
              )}

              {displayed.map((round) => (
                <DataRow
                  key={round.drwNo}
                  round={round}
                  showBonus={showBonus}
                  showNumbers={showNumbers}
                  showDivider={showDivider}
                  theme={theme}
                />
              ))}

              {isReversed && (
                <PredictRow
                  selectedNumbers={selectedNumbers}
                  handleNumberClick={handleNumberClick}
                  showNumbers={showNumbers}
                  showDivider={showDivider}
                  theme={theme}
                />
              )}
            </div>
          </Box>

          {!isReversed && (
            <Box sx={{ display:"flex", justifyContent:"center", mt:3, mb:1 }}>
              <Button
                variant="soft"
                color="inherit"
                onClick={() => setVisibleCount((prev)=>Math.min(prev+30, data.length))}
                disabled={visibleCount >= data.length}
                sx={{ minWidth:40 }}
              >
                ↓
              </Button>
            </Box>
          )}
        </Box>
      </Card>
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------
// Predict Row
// ----------------------------------------------------------------------

function PredictRow({
  selectedNumbers,
  handleNumberClick,
  showNumbers,
  showDivider,
  theme,
}: {
  selectedNumbers: number[];
  handleNumberClick: (num: number) => void;
  showNumbers: boolean;
  showDivider: boolean;
  theme: ThemeType;
}) {
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:"2px" }}>
      <Box
        sx={{
          width:"40px",
          flexShrink:0,
          fontSize:"10px",
          textAlign:"right",
          marginRight:"6px",
          color:"#999",
          fontFamily:"monospace",
          display:{ xs:"none", sm:"block" },
        }}
      >
        예측
      </Box>

      <div style={{ flex:1, display:"flex", gap:"1px" }}>
        {Array.from({ length:45 }, (_,i)=>i+1).map((num)=>{
          const isSelected = selectedNumbers.includes(num);
          const shouldShowDivider = showDivider && num % 5 === 0 && num !== 45;

          const shouldShowNumber = showNumbers ? true : isSelected;
          const bgColor = getPredictCellColor(theme, num, isSelected);
          
          // 텍스트 색상 결정: 선택되었거나 범위별/모노크롬/파스텔 테마일 때는 흰색, 기본 테마일 때는 어두운 색
          const textColor = isSelected || theme !== 'default' ? '#fff' : '#555';

          return (
            <React.Fragment key={num}>
              <div
                onClick={() => handleNumberClick(num)}
                style={{
                  flex:1,
                  minWidth: 0,
                  aspectRatio:"1/1",
                  backgroundColor: bgColor,
                  borderRadius:"20%",
                  cursor:"pointer",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontWeight:"bold",
                  fontSize:"clamp(0.1px, 1.8vw, 12px)",
                  color: shouldShowNumber ? textColor : "transparent",
                }}
              >
                {shouldShowNumber ? num : ""}
              </div>

              {shouldShowDivider && (
                <div
                  style={{
                    width:"1px",
                    backgroundColor:"#999",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Data Row
// ----------------------------------------------------------------------

function DataRow({
  round,
  showBonus,
  showNumbers,
  showDivider,
  theme,
}: {
  round: any;
  showBonus: boolean;
  showNumbers: boolean;
  showDivider: boolean;
  theme: ThemeType;
}) {
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
        {Array.from({ length:45 }, (_,i)=>i+1).map((num)=>{
          const isWinning = round.numbers.includes(num);
          const isBonus = showBonus && round.bonus === num;
          const isClicked = clicked.includes(num);

          const bgColor = getCellColorByTheme(theme, num, isWinning, isBonus, isClicked);

          const shouldShowDivider = showDivider && num % 5 === 0 && num !== 45;

          // ⭐ 숫자를 보여줄지 결정
          const shouldShowNumber = showNumbers || isClicked;

          return (
            <React.Fragment key={`${round.drwNo}-${num}`}>
              <div
                onClick={() => handleClick(num, isWinning)}
                style={{
                  flex:1,
                  minWidth: 0,
                  aspectRatio:"1/1",
                  backgroundColor:bgColor,
                  borderRadius:"20%",
                  cursor:isWinning ? "pointer" : "default",

                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",

                  fontSize:"clamp(1px, 1.8vw, 12px)",
                  fontWeight:"bold",
                  color: shouldShowNumber ? "#fff" : "transparent",
                }}
              >
                {shouldShowNumber ? num : ""}
              </div>

              {shouldShowDivider && (
                <div
                  style={{
                    width:"1px",
                    backgroundColor:"#999",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
