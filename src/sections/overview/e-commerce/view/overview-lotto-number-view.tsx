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
  const [isReversed, setIsReversed] = useState(false); // false: newest first, true: oldest‑first view within current slice
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]); // User selected numbers (max 6)

  // Load all draws sorted newest‑first
  useEffect(() => {
    const allData = getAllLottoNumbers();
    const sortedDesc = [...allData].sort((a, b) => b.drwNo - a.drwNo);
    setData(sortedDesc);
    setVisibleCount(50);
  }, []);

  // Determine which draws to display based on the toggle
  const displayed = (() => {
    const slice = data.slice(0, visibleCount);
    return isReversed ? [...slice].reverse() : slice;
  })();

  // Handle number selection
  const handleNumberClick = (num: number) => {
    if (selectedNumbers.includes(num)) {
      // Deselect
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else if (selectedNumbers.length < 6) {
      // Select (max 6)
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  return (
    <DashboardContent maxWidth="xl">
      <Card>
        <CardHeader
          title="로또 번호 전체 회차 시각화"
          sx={{ mb: 2 }}
          action={
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={showBonus}
                    onChange={(e) => setShowBonus(e.target.checked)}
                    color="primary"
                  />
                }
                label="보너스 번호 보기"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={isReversed}
                    onChange={(e) => setIsReversed(e.target.checked)}
                    color="primary"
                  />
                }
                label="역순 보기"
              />
            </>
          }
        />
        <Box sx={{ p: 2 }}>
          {/* Up arrow at top when reversed */}
          {isReversed && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <Button
                variant="soft"
                color="inherit"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 50, data.length))}
                disabled={visibleCount >= data.length}
                sx={{ minWidth: 40 }}
              >
                ↑
              </Button>
            </Box>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {/* Predict row at top if not reversed */}
            {!isReversed && (
              <PredictRow selectedNumbers={selectedNumbers} handleNumberClick={handleNumberClick} />
            )}

            {/* Existing data rows */}
            {displayed.map((round) => (
              <DataRow key={round.drwNo} round={round} showBonus={showBonus} />
            ))}

            {/* Predict row at bottom if reversed */}
            {isReversed && (
              <PredictRow selectedNumbers={selectedNumbers} handleNumberClick={handleNumberClick} />
            )}
          </div>

          {/* Down arrow at bottom when normal */}
          {!isReversed && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 1 }}>
              <Button
                variant="soft"
                color="inherit"
                onClick={() => setVisibleCount((prev) => Math.min(prev + 50, data.length))}
                disabled={visibleCount >= data.length}
                sx={{ minWidth: 40 }}
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

// ------------------ PredictRow ------------------
function PredictRow({
  selectedNumbers,
  handleNumberClick,
}: {
  selectedNumbers: number[];
  handleNumberClick: (num: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "2px" }}>
      <Box
        sx={{
          width: "40px",
          flexShrink: 0,
          fontSize: "10px",
          lineHeight: 1,
          textAlign: "right",
          marginRight: "6px",
          color: "#999",
          fontFamily: "monospace",
          display: { xs: "none", sm: "block" },
        }}
      >
        예측
      </Box>
      <div style={{ flex: 1, display: "flex", gap: "1px" }}>
        {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
          const isSelected = selectedNumbers.includes(num);
          const showDivider = num % 5 === 0 && num !== 45;

          return (
            <React.Fragment key={num}>
              <div
                title={`${num}번`}
                onClick={() => handleNumberClick(num)}
                style={{
                  flex: 1,
                  aspectRatio: "1/1",
                  backgroundColor: isSelected ? "#ff4444" : "#F1F3F4",
                  borderRadius: "20%",
                  boxShadow: isSelected
                    ? "inset 0 -2px 0 rgba(0,0,0,0.2)"
                    : "inset 0 -1px 0 rgba(0,0,0,0.05)",
                  boxSizing: "border-box",
                  cursor: "pointer",
                  minWidth: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: isSelected ? "#fff" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {isSelected ? num : ""}
              </div>
              {showDivider && (
                <div
                  style={{
                    width: "1px",
                    backgroundColor: "#999999ff",
                    margin: "0 0.5px",
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

// ------------------ DataRow ------------------
function DataRow({
  round,
  showBonus,
}: {
  round: any;
  showBonus: boolean;
}) {
  const [clickedNumbers, setClickedNumbers] = useState<number[]>([]);

  const handleClick = (num: number, isWinning: boolean, isBonus: boolean) => {
    if (!isWinning) return; // 당첨 번호만 클릭 가능
    if (clickedNumbers.includes(num)) {
      setClickedNumbers(clickedNumbers.filter((n) => n !== num));
    } else {
      setClickedNumbers([...clickedNumbers, num]);
    }
  };

  return (
    <div
      style={{ display: "flex", alignItems: "center" }}
      title={`${round.drwNo}회 (${round.drwNoDate})`}
    >
      <Box
        sx={{
          width: "40px",
          flexShrink: 0,
          fontSize: "10px",
          lineHeight: 1,
          textAlign: "right",
          marginRight: "6px",
          color: "#999",
          fontFamily: "monospace",
          display: { xs: "none", sm: "block" },
        }}
      >
        {round.drwNo}
      </Box>
      <div style={{ flex: 1, display: "flex", gap: "1px" }}>
        {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
          const isWinning = round.numbers.includes(num);
          const isBonus = showBonus && round.bonus === num;
          const isClicked = clickedNumbers.includes(num);

          let bgColor = "#F1F3F4";
          if (isWinning) bgColor = isClicked ? "#ff4444" : "#658effff";
          if (isBonus) bgColor = "#FFB74D";

          const showDivider = num % 5 === 0 && num !== 45;

          return (
            <React.Fragment key={`r-${round.drwNo}-${num}`}>
              <div
                onClick={() => handleClick(num, isWinning, isBonus)}
                style={{
                  flex: 1,
                  aspectRatio: "1/1",
                  backgroundColor: bgColor,
                  borderRadius: "20%",
                  boxShadow: isWinning || isBonus
                    ? "inset 0 -2px 0 rgba(0,0,0,0.15)"
                    : "inset 0 -1px 0 rgba(0,0,0,0.05)",
                  boxSizing: "border-box",
                  cursor: isWinning ? "pointer" : "default",
                }}
              />
              {showDivider && (
                <div
                  style={{
                    width: "1px",
                    backgroundColor: "#999999ff",
                    margin: "0 0.5px",
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

