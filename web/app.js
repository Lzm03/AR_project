const fileInput = document.querySelector("#file");
const btn = document.querySelector("#btn");
const statusEl = document.querySelector("#status");
const viewer = document.querySelector("#viewer");
const mv = document.querySelector("#mv");

// 改成你的后端地址
const API_BASE = "http://localhost:3000";

btn.addEventListener("click", async () => {
  const f = fileInput.files?.[0];
  if (!f) return alert("Choose a image");

  btn.disabled = true;
  statusEl.textContent = "Uploading and creating generation tasks...";

  // 1) 上传到后端并创建任务
  const fd = new FormData();
  fd.append("image", f);
  const create = await fetch(`${API_BASE}/api/image-to-3d`, { method: "POST", body: fd });
if (!create.ok) {
  const errText = await create.text().catch(() => "");
  statusEl.textContent = "Fail to generate:" + (errText || create.status);
  btn.disabled = false;
  return;
}
const { taskId, error } = await create.json();
if (!taskId) {
  statusEl.textContent = "Fail to generate:" + (error || "Unkonwn error");
  btn.disabled = false;
  return;
}


  statusEl.textContent = "Task created, generating... (approximately several seconds)";

  // 2) 轮询进度，直到完成
  let done = false;
  for (let i = 0; i < 120; i++) { // 最长 ~6 分钟
    await new Promise(r => setTimeout(r, 3000));
    const q = await fetch(`${API_BASE}/api/image-to-3d/${taskId}`);
    const j = await q.json();

    if (j.status === "SUCCEEDED") {
  const glbUrl = j.glb || null;
  const usdzUrl = j.usdz || null;
  console.log("GLB URL =>", glbUrl);
  console.log("USDZ URL =>", usdzUrl);

  if (!glbUrl && !usdzUrl) {
    statusEl.textContent = "Generation completed, but no usable model link was returned.";
    return;
  }

  // 在状态区放一个可点的直链，用浏览器直接打开看看有没有 403/404
  statusEl.innerHTML = `
    已生成。GLB: ${glbUrl ? `<a href="${glbUrl}" target="_blank">点我测试</a>` : '无'}
    ${usdzUrl ? ` | USDZ: <a href="${usdzUrl}" target="_blank">点我测试</a>` : ''}
    <br/>正在加载到预览中…
  `;

  // 设置 <model-viewer>
  if (glbUrl) mv.setAttribute("src", glbUrl);
  if (usdzUrl) mv.setAttribute("ios-src", usdzUrl);
  viewer.hidden = false;

  // 监听加载/报错
  mv.addEventListener("load", () => {
    statusEl.textContent = "The model has loaded. View the 3D preview on your computer; to see the AR version, open this page on your phone.";
  });
  mv.addEventListener("error", (e) => {
    console.error("model-viewer error:", e);
    statusEl.textContent = "Model loading failed. Please check the browser console (Network/Console) for error messages.";
  });

  return;
}
    if (j.status === "FAILED") {
      statusEl.textContent = "Generation failed:" + (j.error || "");
      break;
    }
    // 进行中，显示进度
    if (j.progress != null) {
      statusEl.textContent = `Generating... ${Math.round(j.progress * 100)}%`;
    } else {
      statusEl.textContent = `Generating...`;
    }
  }
  if (!done && !statusEl.textContent.startsWith("Generation failed")) {
    statusEl.textContent = "Timeout occurred. Please try again later.";
  }
  btn.disabled = false;
});
