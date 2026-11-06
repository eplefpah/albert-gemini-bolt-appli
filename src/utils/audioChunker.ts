// Découpage des gros fichiers audio pour l'API Albert, qui refuse les envois de plus de 20 Mo.
// Le fichier est décodé dans le navigateur, ramené en mono 16 kHz (la fréquence native de Whisper)
// puis réencodé en morceaux WAV d'une durée fixe, chacun nettement sous la limite.

// Limite d'Albert ("Expected: 20.0 MB"), avec une marge.
export const ALBERT_MAX_UPLOAD_BYTES = 19 * 1000 * 1000;

const SAMPLE_RATE = 16000;
// 9 minutes en WAV mono 16 bits à 16 kHz ≈ 17,3 Mo.
const CHUNK_SECONDS = 9 * 60;

export interface AudioChunk {
  blob: Blob;
  // Position du début du morceau dans le fichier d'origine, en secondes.
  offsetSeconds: number;
  durationSeconds: number;
}

export async function splitAudioForAlbert(source: Blob): Promise<AudioChunk[]> {
  // decodeAudioData rééchantillonne directement à la fréquence du contexte.
  const context = new OfflineAudioContext(1, 1, SAMPLE_RATE);
  let decoded: AudioBuffer;
  try {
    decoded = await context.decodeAudioData(await source.arrayBuffer());
  } catch {
    throw new Error(
      'Impossible de lire ce fichier audio dans le navigateur pour le découper. Convertissez-le en MP3 ou WAV, ou réduisez-le sous 20 Mo.'
    );
  }

  const channels = Array.from({ length: decoded.numberOfChannels }, (_, i) => decoded.getChannelData(i));
  const samplesPerChunk = CHUNK_SECONDS * SAMPLE_RATE;
  const chunks: AudioChunk[] = [];

  for (let start = 0; start < decoded.length; start += samplesPerChunk) {
    const end = Math.min(start + samplesPerChunk, decoded.length);
    chunks.push({
      blob: encodeMonoWav(channels, start, end),
      offsetSeconds: start / SAMPLE_RATE,
      durationSeconds: (end - start) / SAMPLE_RATE,
    });
  }
  return chunks;
}

function encodeMonoWav(channels: Float32Array[], start: number, end: number): Blob {
  const sampleCount = end - start;
  const buffer = new ArrayBuffer(44 + sampleCount * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + sampleCount * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, sampleCount * 2, true);

  for (let i = 0; i < sampleCount; i++) {
    let sample = 0;
    for (const channel of channels) sample += channel[start + i];
    sample = Math.max(-1, Math.min(1, sample / channels.length));
    view.setInt16(44 + i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

// Décale les horodatages d'un sous-titre SRT et renumérote ses blocs à partir de firstIndex.
export function shiftSrt(srt: string, offsetSeconds: number, firstIndex: number): { text: string; count: number } {
  const blocks = srt.trim().split(/\r?\n\s*\r?\n/).filter((b) => b.trim());
  const shifted = blocks.map((block, i) => {
    const lines = block.split(/\r?\n/);
    if (/^\d+$/.test(lines[0].trim())) lines[0] = String(firstIndex + i);
    return lines
      .join('\n')
      .replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, (_, h, m, s, ms) =>
        formatSrtTime(+h * 3600 + +m * 60 + +s + +ms / 1000 + offsetSeconds)
      );
  });
  return { text: shifted.join('\n\n'), count: blocks.length };
}

function formatSrtTime(totalSeconds: number): string {
  const ms = Math.round(totalSeconds * 1000);
  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)},${pad(ms % 1000, 3)}`;
}
