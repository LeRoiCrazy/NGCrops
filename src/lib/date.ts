function toIsoDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatIsoDate(date: Date) {
  return toIsoDate(date);
}

export function getLastOddDate(inputDate: Date = new Date()) {
  const currentDay = inputDate.getUTCDate();
  const oddDay = currentDay % 2 === 1 ? currentDay : currentDay - 1;

  return new Date(
    Date.UTC(
      inputDate.getUTCFullYear(),
      inputDate.getUTCMonth(),
      Math.max(1, oddDay)
    )
  );
}

export function getLastOddDateString(inputDate: Date = new Date()) {
  return toIsoDate(getLastOddDate(inputDate));
}

export function getOddDateCandidates(
  inputDate: Date = new Date(),
  count = 12
) {
  const candidates: string[] = [];
  let cursor = getLastOddDate(inputDate);

  for (let index = 0; index < count; index += 1) {
    candidates.push(toIsoDate(cursor));
    cursor = new Date(cursor.getTime() - 2 * 24 * 60 * 60 * 1000);
  }

  return candidates;
}