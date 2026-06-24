import { publicAsset } from '../utils/assets';

export type AvatarSprite = {
  canvas: HTMLCanvasElement | null;
  ready: boolean;
};

const spriteCache = new Map<string, AvatarSprite>();

function loadImage(paths: string[], index = 0): Promise<HTMLImageElement | null> {
  if (index >= paths.length) return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.draggable = false;
    image.onload = () => resolve(image);
    image.onerror = () => resolve(loadImage(paths, index + 1));
    image.src = publicAsset(paths[index]);
  });
}

function processImage(image: HTMLImageElement) {
  const source = document.createElement('canvas');
  source.width = image.naturalWidth;
  source.height = image.naturalHeight;
  const context = source.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, source.width, source.height);
  const data = pixels.data;
  let hasTransparency = false;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 250) {
      hasTransparency = true;
      break;
    }
  }

  if (!hasTransparency) {
    const visited = new Uint8Array(source.width * source.height);
    const queue: number[] = [];
    const enqueue = (x: number, y: number) => {
      const pixel = y * source.width + x;
      if (visited[pixel]) return;
      const offset = pixel * 4;
      if (data[offset] <= 240 || data[offset + 1] <= 240 || data[offset + 2] <= 240) return;
      visited[pixel] = 1;
      queue.push(pixel);
    };
    for (let x = 0; x < source.width; x += 1) {
      enqueue(x, 0);
      enqueue(x, source.height - 1);
    }
    for (let y = 1; y < source.height - 1; y += 1) {
      enqueue(0, y);
      enqueue(source.width - 1, y);
    }
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const pixel = queue[cursor];
      data[pixel * 4 + 3] = 0;
      const x = pixel % source.width;
      const y = Math.floor(pixel / source.width);
      if (x > 0) enqueue(x - 1, y);
      if (x + 1 < source.width) enqueue(x + 1, y);
      if (y > 0) enqueue(x, y - 1);
      if (y + 1 < source.height) enqueue(x, y + 1);
    }
    context.putImageData(pixels, 0, 0);
  }

  let minX = source.width;
  let minY = source.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      if (data[(y * source.width + x) * 4 + 3] > 8) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }
  if (maxX < minX || maxY < minY) return null;
  const cropped = document.createElement('canvas');
  cropped.width = maxX - minX + 1;
  cropped.height = maxY - minY + 1;
  cropped.getContext('2d')?.drawImage(source, minX, minY, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
  return cropped;
}

export function createAvatarSprite(
  paths = ['avatar/girlfriend-pixel.png', 'avatar/girlfriend-pixel.jpg'],
  developmentWarning?: string,
) {
  const key = paths.join('|');
  const cached = spriteCache.get(key);
  if (cached) return cached;
  const sprite: AvatarSprite = { canvas: null, ready: false };
  spriteCache.set(key, sprite);
  void loadImage(paths).then((image) => {
    if (image) {
      sprite.canvas = processImage(image);
    } else if (import.meta.env.DEV && developmentWarning) {
      console.warn(developmentWarning);
    }
    sprite.ready = true;
  });
  return sprite;
}

export function drawAvatarSprite(
  context: CanvasRenderingContext2D,
  sprite: AvatarSprite,
  x: number,
  y: number,
  radius: number,
  fallbackLabel = '♥',
) {
  context.save();
  if (sprite.canvas) {
    const ratio = sprite.canvas.width / sprite.canvas.height;
    const height = radius * 2.35;
    const width = Math.min(radius * 2.5, height * ratio);
    context.imageSmoothingEnabled = false;
    context.drawImage(sprite.canvas, x - width / 2, y - height / 2, width, height);
  } else if (sprite.ready) {
    context.fillStyle = '#ff9fc2';
    context.font = `700 ${Math.max(13, Math.floor(radius * 0.8))}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(fallbackLabel, x, y);
  }
  context.restore();
}
