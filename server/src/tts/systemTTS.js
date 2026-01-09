const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function systemCantoneseTTS(text) {
  return new Promise((resolve, reject) => {
    const audioDir = path.join(process.cwd(), "server/public/audio");
    fs.mkdirSync(audioDir, { recursive: true });

    const filename = `${uuidv4()}.wav`;
    const filepath = path.join(audioDir, filename);

    // macOS 自带粤语语音（Sin-ji）
    const cmd = `say -v Sin-ji "${text.replace(/"/g, '\\"')}" -o "${filepath}"`;

    exec(cmd, (err) => {
      if (err) return reject(err);
      resolve(`/audio/${filename}`);
    });
  });
}

module.exports = systemCantoneseTTS;
