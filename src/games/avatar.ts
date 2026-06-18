import { publicAsset } from '../utils/assets';

export function createAvatarImage() {
  const image = new Image();
  image.src = publicAsset('avatar/girlfriend-pixel.jpg');
  return image;
}

export function drawAvatar(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  radius: number,
) {
  context.save();

  if (image.complete && image.naturalWidth > 0) {
    context.imageSmoothingEnabled = false;
    context.drawImage(image, x - radius, y - radius * 1.18, radius * 2, radius * 2.36);
  } else {
    const gradient = context.createLinearGradient(x - radius, y - radius, x + radius, y + radius);
    gradient.addColorStop(0, '#fff7fb');
    gradient.addColorStop(0.56, '#ff9fc2');
    gradient.addColorStop(1, '#9b5cff');
    context.fillStyle = gradient;
    context.fillRect(x - radius * 0.62, y - radius * 1.05, radius * 1.24, radius * 1.95);
    context.fillStyle = '#ffe0c7';
    context.fillRect(x - radius * 0.4, y - radius * 1.42, radius * 0.8, radius * 0.62);
    context.fillStyle = '#4a173d';
    context.font = `${Math.floor(radius * 0.86)}px serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('♥', x, y - radius * 0.05);
  }

  context.restore();
}
