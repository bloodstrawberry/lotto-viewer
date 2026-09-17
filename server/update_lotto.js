const fs = require('node:fs');
const path = require('node:path');

const LOTTO_API_URL = 'https://www.dhlottery.co.kr/lt645/selectPstLt645InfoNew.do';
const LOTTO_FILE = path.join(__dirname, '..', 'json', 'lottoNumber.json');
const REQUEST_TIMEOUT_MS = 15000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function validateItem(item) {
  const numbers = [item.tm1WnNo, item.tm2WnNo, item.tm3WnNo, item.tm4WnNo, item.tm5WnNo, item.tm6WnNo];
  const isValidBall = (value) => Number.isInteger(value) && value >= 1 && value <= 45;

  if (!Number.isInteger(item.ltEpsd) || item.ltEpsd < 1) {
    throw new Error('회차 번호가 올바르지 않아요.');
  }
  if (!/^\d{8}$/.test(item.ltRflYmd)) {
    throw new Error(`${item.ltEpsd}회 추첨일 형식이 올바르지 않아요.`);
  }
  if (numbers.some((number) => !isValidBall(number)) || new Set(numbers).size !== 6) {
    throw new Error(`${item.ltEpsd}회 당첨 번호가 올바르지 않아요.`);
  }
  if (!isValidBall(item.bnsWnNo) || numbers.includes(item.bnsWnNo)) {
    throw new Error(`${item.ltEpsd}회 보너스 번호가 올바르지 않아요.`);
  }
}

function toLottoItem(item) {
  const date = item.ltRflYmd;
  return {
    totSellamnt: item.wholEpsdSumNtslAmt,
    returnValue: 'success',
    drwNoDate: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
    firstWinamnt: item.rnk1WnAmt,
    drwtNo6: item.tm6WnNo,
    drwtNo4: item.tm4WnNo,
    firstPrzwnerCo: item.rnk1WnNope,
    drwtNo5: item.tm5WnNo,
    bnusNo: item.bnsWnNo,
    firstAccumamnt: item.rnk1SumWnAmt,
    drwNo: item.ltEpsd,
    drwtNo2: item.tm2WnNo,
    drwtNo3: item.tm3WnNo,
    drwtNo1: item.tm1WnNo,
  };
}

async function fetchNewRounds(lastRound, fetchImpl = fetch) {
  const url = new URL(LOTTO_API_URL);
  url.searchParams.set('srchDir', 'latest');
  url.searchParams.set('srchCursorLtEpsd', String(lastRound));
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        headers: { 'User-Agent': 'lotto-viewer-updater/1.0' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`동행복권 API가 HTTP ${response.status}로 응답했어요.`);

      const payload = await response.json();
      if (!Array.isArray(payload?.data?.list)) {
        throw new Error('동행복권 API 응답에 회차 목록이 없어요.');
      }
      payload.data.list.forEach(validateItem);
      return payload.data.list
        .filter((item) => item.ltEpsd > lastRound)
        .sort((first, second) => first.ltEpsd - second.ltEpsd);
    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
      }
    }
  }

  throw new Error('동행복권에서 최신 번호를 가져오지 못했어요.', { cause: lastError });
}

async function updateLottoNumbers({ filePath = LOTTO_FILE, fetchImpl = fetch, dryRun = false } = {}) {
  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('로또 데이터가 비어 있거나 배열이 아니에요.');
  }

  const lastRound = Math.max(...items.map((item) => item.drwNo));
  const newRounds = await fetchNewRounds(lastRound, fetchImpl);
  const knownRounds = new Set(items.map((item) => item.drwNo));
  const addedRounds = [];

  for (const item of newRounds) {
    if (knownRounds.has(item.ltEpsd)) continue;
    items.push(toLottoItem(item));
    knownRounds.add(item.ltEpsd);
    addedRounds.push(item.ltEpsd);
  }

  if (addedRounds.length > 0 && !dryRun) {
    items.sort((first, second) => first.drwNo - second.drwNo);
    fs.writeFileSync(filePath, `${JSON.stringify(items, null, 2)}\n`, 'utf8');
  }

  return { addedRounds, changed: addedRounds.length > 0 };
}

if (require.main === module) {
  updateLottoNumbers({ dryRun: process.argv.includes('--dry-run') })
    .then(({ addedRounds }) => {
      console.log(addedRounds.length ? `추가한 회차: ${addedRounds.join(', ')}` : '이미 최신 로또 번호가 들어 있어요.');
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

module.exports = { updateLottoNumbers };
