import { Queue, Worker } from 'bullmq';
import { spawn } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { downloadToFile, uploadFile, deleteByUrl } from '../lib/storage';

const ffmpegBin = process.env.FFMPEG_PATH || 'ffmpeg';

const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
const connection = {
  host: redisUrl.hostname,
  port: redisUrl.port ? Number(redisUrl.port) : 6379,
};

export const videoQueue = new Queue('video', { connection });

export function startVideoWorker() {
  return new Worker(
    'video',
    async (job) => {
      const { mediaId, originalUrl } = job.data as { mediaId: string; originalUrl: string };

      const tmpInput = `/tmp/${crypto.randomUUID()}_input.mp4`;
      const tmpOutput = `/tmp/${crypto.randomUUID()}_output.mp4`;

      try {
        await downloadToFile(originalUrl, tmpInput);

        await new Promise<void>((resolve, reject) => {
          const ffmpeg = spawn(ffmpegBin, [
            '-i', tmpInput,
            '-t', '180',
            '-vf', 'scale=1280:-2',
            '-c:v', 'libx264',
            '-crf', '23',
            '-preset', 'fast',
            '-c:a', 'aac',
            '-movflags', '+faststart',
            '-y', tmpOutput,
          ]);

          ffmpeg.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`ffmpeg exited with code ${code}`));
          });
          ffmpeg.on('error', reject);
        });

        const outputKey = `media/${crypto.randomUUID()}_out.mp4`;
        const outputUrl = await uploadFile(outputKey, tmpOutput, 'video/mp4');

        await deleteByUrl(originalUrl);

        await prisma.kudoMedia.update({
          where: { id: mediaId },
          data: { url: outputUrl, status: 'ready' },
        });
      } finally {
        if (fs.existsSync(tmpInput)) fs.unlinkSync(tmpInput);
        if (fs.existsSync(tmpOutput)) fs.unlinkSync(tmpOutput);
      }
    },
    { connection },
  );
}
