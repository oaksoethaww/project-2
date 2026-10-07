import test from "node:test";
import assert from "node:assert/strict";
import { totals, weeklyDays, dateKey } from "../src/services/statistics.js";

test("totals handle empty data and aggregate the recorded metrics", () => {
  assert.deepEqual(totals([]), {
    workouts: 0,
    sets: 0,
    duration: 0,
    calories: 0,
  });
  assert.deepEqual(
    totals([
      { sets: 3, duration: 12.5, calories: 70 },
      { sets: 4, duration: 7.5, calories: 30 },
    ]),
    { workouts: 2, sets: 7, duration: 20, calories: 100 },
  );
});
test("weekly statistics use Monday to Sunday across the year boundary", () => {
  const workouts = [
    { date: "2025-12-29T00:00:00.000Z", sets: 3, duration: 30, calories: 100 },
    { date: "2026-01-04T00:00:00.000Z", sets: 4, duration: 40, calories: 200 },
    { date: "2026-01-05T00:00:00.000Z", sets: 5, duration: 50, calories: 300 },
  ];
  const week = weeklyDays(workouts, new Date(2026, 0, 4, 23));
  assert.equal(week[0].date, "2025-12-29");
  assert.equal(week[6].date, "2026-01-04");
  assert.deepEqual(
    week.map((day) => day.workouts),
    [1, 0, 0, 0, 0, 0, 1],
  );
  assert.equal(week[6].calories, 200);
});
test("date input keys use the local calendar day", () => {
  assert.equal(dateKey(new Date(2026, 0, 2, 23, 59)), "2026-01-02");
});
