import speech from "@google-cloud/speech";

const client = new speech.SpeechClient();

export function createRecognizer(ws) {
  const request = {
    config: {
      encoding: "WEBM_OPUS",
      sampleRateHertz: 48000,
      languageCode: "zh-HK",
      enableAutomaticPunctuation: true
    },
    interimResults: true
  };

  const stream = client.streamingRecognize(request);

  stream.on("data", data => {
    const r = data.results?.[0];
    if (!r) return;

    ws.send(JSON.stringify({
      text: r.alternatives[0].transcript,
      final: r.isFinal
    }));
  });

  return stream;
}
