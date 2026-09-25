import { formatDate, getWeekStart, getWeekEnd } from "../../utils/dateUtils";
test("web and mobile use Monday week keys including Sunday boundary", () => {
  for (const day of [21, 24, 27]) {
    const date = new Date(2026, 8, day, 12);
    expect(formatDate(getWeekStart(date))).toBe("2026-09-21");
    expect(formatDate(getWeekEnd(date))).toBe("2026-09-27");
  }
});
