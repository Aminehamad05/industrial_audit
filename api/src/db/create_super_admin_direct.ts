import bcrypt from "bcryptjs";
import sql from "mssql";
import { randomUUID } from "crypto";

const BCRYPT_ROUNDS = 12;

const DB_CONFIG = {
  server: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "AMINE@hmad05",
  database: process.env.DB_NAME || "audit_system",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function createSuperAdminDirect() {
  const email = "amine@test.com";
  const username = "amine";
  const plainPassword = "amine2005";
  const fullName = "Super Administrator";
  const role = "Administrator";
  const accountStatus = "Active";

  const pool = await sql.connect(DB_CONFIG);

  const existing = await pool
    .request()
    .input("email", sql.VarChar(254), email)
    .query("SELECT id FROM users WHERE email = @email");

  if (existing.recordset.length > 0) {
    console.log("Super admin already exists, skipping.");
    await pool.close();
    return;
  }

  const id = randomUUID();
  const passwordHash = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

  await pool
    .request()
    .input("id", sql.VarChar(36), id)
    .input("username", sql.VarChar(64), username)
    .input("email", sql.VarChar(254), email)
    .input("passwordHash", sql.VarChar(255), passwordHash)
    .input("fullName", sql.VarChar(128), fullName)
    .input("role", sql.VarChar(32), role)
    .input("accountStatus", sql.VarChar(16), accountStatus).query(`
      INSERT INTO users (id, username, email, password_hash, full_name, role, account_status, created_at, updated_at)
      VALUES (@id, @username, @email, @passwordHash, @fullName, @role, @accountStatus, GETDATE(), GETDATE())
    `);

  console.log("Super admin created:");
  console.log(`  username: ${username}`);
  console.log(`  password: ${plainPassword}`);
  console.log(`  email: ${email}`);

  await pool.close();
}

createSuperAdminDirect().catch((err) => {
  console.error("Failed to create super admin:", err);
  process.exit(1);
});
