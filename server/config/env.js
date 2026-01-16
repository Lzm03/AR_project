import dotenv from "dotenv";
dotenv.config();

const required = [
  "PORT",
  "DEEPSEEK_API_KEY",
  "MINIMAX_API_KEY"
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`❌ Missing env: ${key}`);
  }
}
