'use client';

import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

import { DashboardContent } from "src/layouts/dashboard";
import { getAllLottoNumbers } from "src/api/lottolibrary";

// ----------------------------------------------------------------------

export function OverviewLottoNumberView() {
  const [data, setData] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(50);
  const [showBonus, setShowBonus] = useState(false);
  const [isReversed, setIsReversed] = useState(false);

  // ⭐ 숫자 보기 토글 (ON → 숫자 전체 보임)
  const [showNumbers, setShowNumbers] = useState(true);

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  useEffect(() => {
    const allData = getAllLottoNumbers();
    const sortedDesc = [...allData].sort((a, b) => b.drwNo - a.drwNo);
    setData(sortedDesc);
    setVisibleCount(50);
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
            <>
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
                    checked={isReversed}
                    onChange={(e) => setIsReversed(e.target.checked)}
                  />
                }
                label="역순"
              />
            </>
          }
        />
        <Box sx={{ p: 2 }}>
          {isReversed && (
            <Box sx={{ display:"flex", justifyContent:"center", mb:1 }}>
              <Button
                variant="soft"
                color="inherit"
                onClick={() => setVisibleCount((prev)=>Math.min(prev+50, data.length))}
                disabled={visibleCount >= data.length}
                sx={{ minWidth:40 }}
              >
                ↑
              </Button>
            </Box>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {!isReversed && (
              <PredictRow
                selectedNumbers={selectedNumbers}
                handleNumberClick={handleNumberClick}
                showNumbers={showNumbers}
              />
            )}

            {displayed.map((round) => (
              <DataRow
                key={round.drwNo}
                round={round}
                showBonus={showBonus}
                showNumbers={showNumbers}
              />
            ))}

            {isReversed && (
              <PredictRow
                selectedNumbers={selectedNumbers}
                handleNumberClick={handleNumberClick}
                showNumbers={showNumbers}
              />
            )}
          </div>

          {!isReversed && (
            <Box sx={{ display:"flex", justifyContent:"center", mt:3, mb:1 }}>
              <Button
                variant="soft"
                color="inherit"
                onClick={() => setVisibleCount((prev)=>Math.min(prev+50, data.length))}
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
}: {
  selectedNumbers: number[];
  handleNumberClick: (num: number) => void;
  showNumbers: boolean;
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
          const showDivider = num % 5 === 0 && num !== 45;

          const shouldShowNumber = showNumbers ? true : isSelected;

          return (
            <React.Fragment key={num}>
              <div
                onClick={() => handleNumberClick(num)}
                style={{
                  flex:1,
                  aspectRatio:"1/1",
                  backgroundColor: isSelected ? "#ff4444" : "#E8EAED",
                  borderRadius:"20%",
                  cursor:"pointer",

                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontWeight:"bold",
                  fontSize:"clamp(0.1px, 1.8vw, 12px)",
                  color: shouldShowNumber ? (isSelected?"#fff":"#555") : "transparent",
                }}
              >
                {shouldShowNumber ? num : ""}
              </div>

              {showDivider && (
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
}: {
  round: any;
  showBonus: boolean;
  showNumbers: boolean;
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

          let bgColor = "#F1F3F4";
          if (isWinning) bgColor = isClicked ? "#ff4444" : "#658effff";
          if (isBonus) bgColor = "#FFB74D";

          const showDivider = num % 5 === 0 && num !== 45;

          // ⭐ 숫자를 보여줄지 결정
          const shouldShowNumber = showNumbers || isClicked;

          return (
            <React.Fragment key={`${round.drwNo}-${num}`}>
              <div
                onClick={() => handleClick(num, isWinning)}
                style={{
                  flex:1,
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

              {showDivider && (
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
