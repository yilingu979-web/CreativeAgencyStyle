import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const files = process.argv.slice(2);
if (!files.length) throw new Error('Pass one or more video files to verify.');
for (const file of files) {
  if (!existsSync(file)) throw new Error(`Missing media file: ${file}`);
  const details = JSON.parse(execFileSync('ffprobe', [
    '-v', 'error', '-show_entries', 'stream=codec_type,codec_name', '-of', 'json', file,
  ], { encoding: 'utf8' }));
  const video = details.streams.find((stream) => stream.codec_type === 'video');
  const audio = details.streams.find((stream) => stream.codec_type === 'audio');
  if (video?.codec_name !== 'h264' || (audio && audio.codec_name !== 'aac')) {
    throw new Error(`${file} must contain H.264 video and AAC audio.`);
  }
}
