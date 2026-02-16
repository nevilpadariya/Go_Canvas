export interface SemesterRangeOptions {
  yearsBack?: number;
  yearsForward?: number;
  includeSummer?: boolean;
  startYear?: number;
}

type Term = "SPRING" | "SUMMER" | "FALL";

function getTermForMonth(month: number): Term {
  if (month <= 4) return "SPRING";
  if (month <= 6) return "SUMMER";
  return "FALL";
}

export function getCurrentSemesterCode(date = new Date()): string {
  const year = date.getFullYear().toString().slice(-2);
  const term = getTermForMonth(date.getMonth());
  return `${term}${year}`;
}

export function getSemesterOptions(
  date = new Date(),
  options: SemesterRangeOptions = {}
): string[] {
  const {
    yearsBack = 1,
    yearsForward = 2,
    includeSummer = true,
    startYear = date.getFullYear() - yearsBack,
  } = options;

  const endYear = date.getFullYear() + yearsForward;
  const terms: Term[] = includeSummer
    ? ["SPRING", "SUMMER", "FALL"]
    : ["SPRING", "FALL"];
  const result: string[] = [];

  for (let year = startYear; year <= endYear; year += 1) {
    const yy = year.toString().slice(-2);
    for (const term of terms) {
      result.push(`${term}${yy}`);
    }
  }

  return result;
}
