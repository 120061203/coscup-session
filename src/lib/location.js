// Room codes look like "TR509", "RB105", "AU", "TR309 教室外走廊".
// Building is the leading letters; for TR/RB the next digit is the floor
// (TR = 教室大樓 2F-5F, RB = 研究大樓 1F). AU (大禮堂) has no floor.
export function parseLocation(room) {
  const raw = (room || '').trim()
  const match = raw.match(/^([A-Za-z]+)(\d)?/)
  if (!match) return { raw, building: raw || '其他', floor: null }

  const building = match[1].toUpperCase()
  const floor = match[2] ? Number(match[2]) : null
  return { raw, building, floor }
}

export function locationLabel({ building, floor }) {
  return floor ? `${building} ${floor}F` : building
}

// TR floors are all in the same building (just take the stairs/escalator);
// AU and RB are separate buildings and take real walking time to reach.
export function isFarBuilding(building) {
  return building !== 'TR'
}
