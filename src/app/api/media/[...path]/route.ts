import { constants } from 'node:fs';
import { open, realpath } from 'node:fs/promises';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { hasAccess } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
};

function fail(status: number) {
  return new NextResponse(null, {
    status,
    headers: { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' },
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  if (!(await hasAccess())) return fail(401);
  const segments = (await context.params).path;
  if (
    !segments?.length ||
    segments.some(
      (segment) => !segment || segment === '.' || segment === '..' || /[\\/\0]/.test(segment),
    )
  )
    return fail(400);
  const mime = TYPES[path.extname(segments.at(-1)!).toLowerCase()];
  if (!mime) return fail(415);
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    const root = await realpath(path.join(process.cwd(), 'private-media'));
    const file = await realpath(path.join(root, ...segments));
    if (!file.startsWith(root + path.sep)) return fail(403);
    // Realpath checks all parents; O_NOFOLLOW also blocks a replaced final symlink.
    handle = await open(file, constants.O_RDONLY | constants.O_NOFOLLOW);
    const info = await handle.stat();
    if (!info.isFile()) return fail(404);
    let start = 0;
    let end = info.size - 1;
    const range = request.headers.get('range');
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match || (!match[1] && !match[2])) return fail(416);
      if (!match[1]) start = Math.max(0, info.size - Number(match[2]));
      else start = Number(match[1]);
      if (match[1] && match[2]) end = Math.min(Number(match[2]), end);
      if (
        !Number.isSafeInteger(start) ||
        !Number.isSafeInteger(end) ||
        start < 0 ||
        start > end ||
        start >= info.size
      ) {
        return new NextResponse(null, {
          status: 416,
          headers: {
            'Content-Range': `bytes */${info.size}`,
            'Cache-Control': 'private, no-store',
          },
        });
      }
    }
    const length = Math.max(0, end - start + 1);
    const ownedHandle = handle;
    handle = undefined;
    let cursor = start;
    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          if (cursor > end) {
            await ownedHandle.close();
            controller.close();
            return;
          }
          const chunk = Buffer.alloc(Math.min(64 * 1024, end - cursor + 1));
          const { bytesRead } = await ownedHandle.read(chunk, 0, chunk.length, cursor);
          if (!bytesRead) {
            await ownedHandle.close();
            controller.close();
            return;
          }
          cursor += bytesRead;
          controller.enqueue(chunk.subarray(0, bytesRead));
        } catch (error) {
          await ownedHandle.close().catch(() => undefined);
          controller.error(error);
        }
      },
      async cancel() {
        await ownedHandle.close().catch(() => undefined);
      },
    });
    return new NextResponse(stream, {
      status: range ? 206 : 200,
      headers: {
        'Content-Type': mime,
        'Content-Length': String(length),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        ...(range ? { 'Content-Range': `bytes ${start}-${end}/${info.size}` } : {}),
      },
    });
  } catch {
    return fail(404);
  } finally {
    await handle?.close().catch(() => undefined);
  }
}
