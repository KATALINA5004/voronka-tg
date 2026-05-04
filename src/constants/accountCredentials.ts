/** Пары логин + код. Логины: vn_001 … vn_056. */
export const ACCOUNT_PAIRS = [
  { login: "vn_001", code: "M7KQ-2H9P-4VNC" },
  { login: "vn_002", code: "B3WR-8L2F-9TXD" },
  { login: "vn_003", code: "K9NM-5C1J-7YQP" },
  { login: "vn_004", code: "H4VF-3D8R-2WLS" },
  { login: "vn_005", code: "P2JC-6N9K-1MHT" },
  { login: "vn_006", code: "T8QX-4B7Y-5GFR" },
  { login: "vn_007", code: "L5WD-9F3M-8KNC" },
  { login: "vn_008", code: "R1YB-7H2P-6TXQ" },
  { login: "vn_009", code: "N6KC-3J9L-4WDM" },
  { login: "vn_010", code: "F9GT-2M5R-8YHN" },
  { login: "vn_011", code: "V3LP-8Q1C-7KJB" },
  { login: "vn_012", code: "D7WN-4T9H-2MFX" },
  { login: "vn_013", code: "Y2HC-6K8P-3LQR" },
  { login: "vn_014", code: "W5MJ-1F4N-9BGT" },
  { login: "vn_015", code: "C8RK-5Y2J-6HPL" },
  { login: "vn_016", code: "Q4TF-9M7D-1NWC" },
  { login: "vn_017", code: "J1NB-3L8K-5YRH" },
  { login: "vn_018", code: "G6PW-7R4C-2TXM" },
  { login: "vn_019", code: "X9HD-2W6F-8KQL" },
  { login: "vn_020", code: "M3LC-8B1Y-4JNP" },
  { login: "vn_021", code: "B7YK-5T9M-3HFR" },
  { login: "vn_022", code: "K2NJ-6P4L-9WDC" },
  { login: "vn_023", code: "H8QF-1R7K-5MGT" },
  { login: "vn_024", code: "P5WC-9D2J-7YLN" },
  { login: "vn_025", code: "T3MR-4H8N-1KFB" },
  { login: "vn_026", code: "L9GD-7Y3P-6TXQ" },
  { login: "vn_027", code: "R6HF-2K9M-4WJC" },
  { login: "vn_028", code: "N1BL-8T5R-3YKP" },
  { login: "vn_029", code: "F4NC-6J2H-9MQD" },
  { login: "vn_030", code: "V7YT-3W8L-5KFR" },
  { login: "vn_031", code: "D2PK-9M1C-7HNB" },
  { login: "vn_032", code: "Y5WJ-4L6R-2TXG" },
  { login: "vn_033", code: "W8HC-1N9K-6YMP" },
  { login: "vn_034", code: "C3RL-7F2D-8KQT" },
  { login: "vn_035", code: "Q9MN-5B4J-3HWR" },
  { login: "vn_036", code: "J6TD-2Y8P-1LFK" },
  { login: "vn_037", code: "G1KW-8H3M-9NRC" },
  { login: "vn_038", code: "X4LF-6R9C-5YJB" },
  { login: "vn_039", code: "M9HC-3W7N-2KTP" },
  { login: "vn_040", code: "B2YJ-7L4F-8MQD" },
  { login: "vn_041", code: "K5NR-1T9K-4HGW" },
  { login: "vn_042", code: "H7MC-9P2L-6YJF" },
  { login: "vn_043", code: "P8WK-4D7R-3NTQ" },
  { login: "vn_044", code: "T1GL-6H8M-5YKC" },
  { login: "vn_045", code: "L4NF-2J9P-7WRD" },
  { login: "vn_046", code: "R9YT-5M3C-1KHL" },
  { login: "vn_047", code: "N3BD-8W6R-4JFQ" },
  { login: "vn_048", code: "F6LC-1K9N-9HMT" },
  { login: "vn_049", code: "V2PR-7Y4J-5WGK" },
  { login: "vn_050", code: "D9HM-3T8L-2NYC" },
  { login: "vn_051", code: "Y7KF-6R1P-8MJQ" },
  { login: "vn_052", code: "W4JC-9N5H-3LTR" },
  { login: "vn_053", code: "C6WP-2M7K-1YFD" },
  { login: "vn_054", code: "Q1NR-8L4C-6HTK" },
  { login: "vn_055", code: "J8YD-5T2M-9KWG" },
  { login: "vn_056", code: "G3HF-7W9R-4NLP" }
] as const;

export type AccountPair = (typeof ACCOUNT_PAIRS)[number];

export function normalizeLoginKey(raw: string): string {
  return raw.trim().toLowerCase();
}

export function normalizeAccessCode(raw: string): string | null {
  const alnum = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (alnum.length !== 12) return null;
  return `${alnum.slice(0, 4)}-${alnum.slice(4, 8)}-${alnum.slice(8, 12)}`;
}

const LOGIN_TO_CODE = new Map<string, string>(ACCOUNT_PAIRS.map((p) => [normalizeLoginKey(p.login), p.code]));

/** Возвращает канонический логин из списка или null. */
export function matchCredentials(loginRaw: string, codeRaw: string): string | null {
  const login = normalizeLoginKey(loginRaw);
  const code = normalizeAccessCode(codeRaw);
  if (!login || !code) return null;
  const expected = LOGIN_TO_CODE.get(login);
  if (!expected || expected !== code) return null;
  const row = ACCOUNT_PAIRS.find((p) => normalizeLoginKey(p.login) === login);
  return row ? row.login : null;
}
