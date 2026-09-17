const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { updateLottoNumbers } = require('./update_lotto');

function createFixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'lotto-viewer-update-'));
  const filePath = path.join(directory, 'lottoNumber.json');
  fs.writeFileSync(filePath, JSON.stringify([{ drwNo: 1240, drwNoDate: '2026-09-05' }]));
  return { directory, filePath };
}

function createResponse(round = 1241) {
  return Response.json({
    data: {
      list: [{
        ltEpsd: round,
        ltRflYmd: '20260912',
        tm1WnNo: 7,
        tm2WnNo: 13,
        tm3WnNo: 16,
        tm4WnNo: 23,
        tm5WnNo: 24,
        tm6WnNo: 43,
        bnsWnNo: 9,
        rnk1WnNope: 18,
        rnk1WnAmt: 1628391980,
        rnk1SumWnAmt: 29311055640,
        wholEpsdSumNtslAmt: 121918085000,
      }],
    },
  });
}

test('새 회차를 한 번만 추가하고 기존 파일 형식을 유지해요', async (context) => {
  const fixture = createFixture();
  context.after(() => fs.rmSync(fixture.directory, { recursive: true, force: true }));
  const fetchImpl = async () => createResponse();

  const first = await updateLottoNumbers({ filePath: fixture.filePath, fetchImpl });
  const items = JSON.parse(fs.readFileSync(fixture.filePath, 'utf8'));
  assert.deepEqual(first.addedRounds, [1241]);
  assert.equal(items.length, 2);
  assert.deepEqual(items[1], {
    totSellamnt: 121918085000,
    returnValue: 'success',
    drwNoDate: '2026-09-12',
    firstWinamnt: 1628391980,
    drwtNo6: 43,
    drwtNo4: 23,
    firstPrzwnerCo: 18,
    drwtNo5: 24,
    bnusNo: 9,
    firstAccumamnt: 29311055640,
    drwNo: 1241,
    drwtNo2: 13,
    drwtNo3: 16,
    drwtNo1: 7,
  });

  const second = await updateLottoNumbers({ filePath: fixture.filePath, fetchImpl });
  assert.equal(second.changed, false);
  assert.equal(JSON.parse(fs.readFileSync(fixture.filePath, 'utf8')).length, 2);
});

test('드라이런에서는 파일을 바꾸지 않아요', async (context) => {
  const fixture = createFixture();
  context.after(() => fs.rmSync(fixture.directory, { recursive: true, force: true }));
  const before = fs.readFileSync(fixture.filePath, 'utf8');
  const result = await updateLottoNumbers({
    filePath: fixture.filePath,
    fetchImpl: async () => createResponse(),
    dryRun: true,
  });
  assert.equal(result.changed, true);
  assert.equal(fs.readFileSync(fixture.filePath, 'utf8'), before);
});

test('잘못된 번호를 받으면 기존 파일을 보존해요', async (context) => {
  const fixture = createFixture();
  context.after(() => fs.rmSync(fixture.directory, { recursive: true, force: true }));
  const before = fs.readFileSync(fixture.filePath, 'utf8');
  const fetchImpl = async () => {
    const response = await createResponse().json();
    response.data.list[0].bnsWnNo = 7;
    return Response.json(response);
  };
  await assert.rejects(updateLottoNumbers({ filePath: fixture.filePath, fetchImpl }));
  assert.equal(fs.readFileSync(fixture.filePath, 'utf8'), before);
});
