import fs from "fs";
import path from "path";

if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  const credPath = path.join(process.cwd(), "google-credentials.json");

  fs.writeFileSync(
    credPath,
    Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64")
  );

  process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
  console.log("✅ Google credentials loaded");
}
