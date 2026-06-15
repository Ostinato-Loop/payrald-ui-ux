/**
 * Seed script — run once after schema push to populate reference data.
 * Usage:  pnpm --filter @workspace/db run seed
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { banksTable } from "./schema/withdrawals.js";
import { sql } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const NGN_BANKS: { code: string; name: string; shortName: string; logo: string | null }[] = [
  { code: "044", name: "Access Bank", shortName: "Access", logo: null },
  { code: "063", name: "Access Bank (Diamond)", shortName: "Diamond", logo: null },
  { code: "035", name: "Wema Bank", shortName: "Wema", logo: null },
  { code: "035A", name: "ALAT by Wema", shortName: "ALAT", logo: null },
  { code: "023", name: "Citibank Nigeria", shortName: "Citibank", logo: null },
  { code: "050", name: "Ecobank Nigeria", shortName: "Ecobank", logo: null },
  { code: "562", name: "Ekondo Microfinance Bank", shortName: "Ekondo MFB", logo: null },
  { code: "070", name: "Fidelity Bank", shortName: "Fidelity", logo: null },
  { code: "011", name: "First Bank of Nigeria", shortName: "First Bank", logo: null },
  { code: "214", name: "First City Monument Bank (FCMB)", shortName: "FCMB", logo: null },
  { code: "058", name: "Guaranty Trust Bank (GTB)", shortName: "GTBank", logo: null },
  { code: "030", name: "Heritage Bank", shortName: "Heritage", logo: null },
  { code: "301", name: "Jaiz Bank", shortName: "Jaiz", logo: null },
  { code: "082", name: "Keystone Bank", shortName: "Keystone", logo: null },
  { code: "526", name: "Parallex Bank", shortName: "Parallex", logo: null },
  { code: "076", name: "Polaris Bank", shortName: "Polaris", logo: null },
  { code: "101", name: "Providus Bank", shortName: "Providus", logo: null },
  { code: "221", name: "Stanbic IBTC Bank", shortName: "Stanbic IBTC", logo: null },
  { code: "068", name: "Standard Chartered Bank", shortName: "Standard Chartered", logo: null },
  { code: "232", name: "Sterling Bank", shortName: "Sterling", logo: null },
  { code: "100", name: "Suntrust Bank", shortName: "Suntrust", logo: null },
  { code: "032", name: "Union Bank of Nigeria", shortName: "Union Bank", logo: null },
  { code: "033", name: "United Bank for Africa (UBA)", shortName: "UBA", logo: null },
  { code: "215", name: "Unity Bank", shortName: "Unity", logo: null },
  { code: "035B", name: "VFD Microfinance Bank", shortName: "VFD MFB", logo: null },
  { code: "057", name: "Zenith Bank", shortName: "Zenith", logo: null },
  { code: "120001", name: "9Payment Service Bank (9PSB)", shortName: "9PSB", logo: null },
  { code: "000026", name: "Taj Bank", shortName: "Taj", logo: null },
  { code: "000036", name: "Optimus Bank", shortName: "Optimus", logo: null },
  { code: "000027", name: "Globus Bank", shortName: "Globus", logo: null },
  { code: "000023", name: "Paycom (OPay)", shortName: "OPay", logo: null },
  { code: "000025", name: "Kuda Bank", shortName: "Kuda", logo: null },
  { code: "000017", name: "Cellulant", shortName: "Cellulant", logo: null },
  { code: "000013", name: "GTBank MFB", shortName: "GT MFB", logo: null },
  { code: "000014", name: "Zenith Easy Wallet", shortName: "Zenith EW", logo: null },
  { code: "000016", name: "TrustBanc Financial Group", shortName: "TrustBanc", logo: null },
  { code: "000019", name: "PatrickGold Microfinance Bank", shortName: "PatrickGold", logo: null },
  { code: "000020", name: "Moneymaster PSB (MPSP)", shortName: "Moneymaster", logo: null },
  { code: "000021", name: "Smartcash PSB (Airtel)", shortName: "SmartCash", logo: null },
  { code: "000022", name: "MTN MoMo PSB", shortName: "MoMo", logo: null },
  { code: "000024", name: "Sparkle Microfinance Bank", shortName: "Sparkle", logo: null },
  { code: "000029", name: "Lotus Bank", shortName: "Lotus", logo: null },
  { code: "000031", name: "PalmPay", shortName: "PalmPay", logo: null },
  { code: "000033", name: "Moniepoint MFB", shortName: "Moniepoint", logo: null },
  { code: "000034", name: "Fairmoney Microfinance Bank", shortName: "Fairmoney", logo: null },
  { code: "000035", name: "Carbon (One Finance)", shortName: "Carbon", logo: null },
  { code: "000038", name: "Paga", shortName: "Paga", logo: null },
  { code: "100004", name: "Opay Digital Services", shortName: "Opay", logo: null },
  { code: "110001", name: "VT Networks (VCORP)", shortName: "VT Networks", logo: null },
  { code: "090267", name: "Kuda Microfinance Bank", shortName: "Kuda MFB", logo: null },
];

console.log(`Seeding ${NGN_BANKS.length} banks…`);

await db
  .insert(banksTable)
  .values(NGN_BANKS)
  .onConflictDoUpdate({
    target: banksTable.code,
    set: {
      name: sql`excluded.name`,
      shortName: sql`excluded.short_name`,
      supported: sql`true`,
    },
  });

console.log("✓ Banks seeded successfully.");
await pool.end();
