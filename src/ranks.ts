const ranges = [
  ["Bronze I", 0, 765.42],
  ["Bronze II", 765.43, 913.71],
  ["Bronze III", 913.72, 1054.86],
  ["Silver I", 1054.87, 1188.87],
  ["Silver II", 1188.88, 1315.74],
  ["Silver III", 1315.75, 1435.47],
  ["Gold I", 1435.48, 1548.06],
  ["Gold II", 1548.07, 1653.51],
  ["Gold III", 1653.52, 1751.82],
  ["Platinum I", 1751.83, 1842.99],
  ["Platinum II", 1843, 1927.02],
  ["Platinum III", 1927.03, 2003.91],
  ["Diamond I", 2003.92, 2073.66],
  ["Diamond II", 2073.67, 2136.27],
  ["Diamond III", 2136.28, 2191.74],
  ["Master I", 2191.75, 2274.99],
  ["Master II", 2275, 2350],
  ["Master III", 2350, Infinity],
] as [string, number, number][];

export function getRank(
  numGames: number,
  rating: number,
  dailyGlobalPlacement?: number,
  dailyRegionalPlacement?: number
) {
  if (numGames === 0) return "None";
  if (numGames < 5) return "Pending";
  if (
    rating >= 2191.75 &&
    (dailyGlobalPlacement != null || dailyRegionalPlacement != null)
  ) {
    return "Grandmaster";
  }

  for (const [rank, min, max] of ranges) {
    if (min < rating && rating < max) return rank;
  }

  return "Unknown";
}
