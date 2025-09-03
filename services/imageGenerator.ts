import { Group, Product, Theme, FontStyle } from '../types';
import { getImages } from './db';

const PADDING = 60;
const TITLE_HEIGHT = 120;
const GAP = 40;
const CAPTION_HEIGHT = 60;
const IMAGE_WIDTH = 400;
const IMAGE_HEIGHT = 400;

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const getFontString = (font: FontStyle): string => {
  const style = font.style === 'italic' ? 'italic' : '';
  const weight = font.weight === 'bold' ? 'bold' : '';
  // Wrap font family in quotes to handle names with spaces
  return [style, weight, `${font.size}px`, `"${font.family}"`].filter(Boolean).join(' ');
};


export const renderFrameToDataURL = async (group: Group, theme: Theme): Promise<string | null> => {
  const { name: groupName, products } = group;
  const activeProducts = products.filter(p => p.isActive);
  if (activeProducts.length === 0) {
    console.warn("No active products to generate an image.");
    return null;
  }

  // Pre-calculate font strings
  const titleFontString = getFontString(theme.styles.titleFont);
  const captionFontString = getFontString(theme.styles.captionFont);
  
  // Ensure custom fonts are loaded before drawing on canvas
  try {
    await document.fonts.load(titleFontString);
    await document.fonts.load(captionFontString);
  } catch (err) {
      console.warn('Could not load custom fonts, will fall back to system fonts.', err);
  }

  // Collect all image IDs that need to be fetched
  const productImageIds = activeProducts.map(p => p.imageId);
  const allImageIds = [...productImageIds];
  if (group.background?.type === 'image') {
    allImageIds.push(group.background.imageId);
  }

  // Fetch all images from IndexedDB in parallel
  const imageMap = await getImages(allImageIds);

  const cols = Math.min(3, activeProducts.length);
  const rows = Math.ceil(activeProducts.length / cols);

  const canvasWidth = PADDING * 2 + cols * IMAGE_WIDTH + (cols - 1) * GAP;
  const canvasHeight = PADDING * 2 + TITLE_HEIGHT + rows * (IMAGE_HEIGHT + CAPTION_HEIGHT) + (rows - 1) * GAP;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error("Failed to create canvas context.");
    return null;
  }

  // Background
  if (group.background?.type === 'color') {
    ctx.fillStyle = group.background.value;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  } else if (group.background?.type === 'image') {
    const bgImageData = imageMap[group.background.imageId];
    if (bgImageData) {
        try {
            const bgImg = await loadImage(bgImageData);
            ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
        } catch (error) {
            console.error('Failed to load background image, falling back to theme color.', error);
            ctx.fillStyle = theme.styles.backgroundColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
    } else {
        console.error('Background image not found in DB, falling back to theme color.');
        ctx.fillStyle = theme.styles.backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
  } else {
    // Default Background from theme
    ctx.fillStyle = theme.styles.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }


  // Title
  ctx.fillStyle = theme.styles.titleColor;
  ctx.font = titleFontString;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // Add a subtle shadow to make text more readable on any background
  ctx.shadowColor = theme.styles.shadowColor;
  ctx.shadowBlur = 10;
  ctx.fillText(groupName, canvasWidth / 2, PADDING + TITLE_HEIGHT / 2);
  ctx.shadowColor = 'transparent'; // Reset shadow
  ctx.shadowBlur = 0;

  // Products
  for (let i = 0; i < activeProducts.length; i++) {
    const product = activeProducts[i];
    const row = Math.floor(i / cols);
    const col = i % cols;

    const x = PADDING + col * (IMAGE_WIDTH + GAP);
    const y = PADDING + TITLE_HEIGHT + row * (IMAGE_HEIGHT + CAPTION_HEIGHT + GAP);
    
    const productImageData = imageMap[product.imageId];
    if (productImageData) {
        try {
          const img = await loadImage(productImageData);
          ctx.drawImage(img, x, y, IMAGE_WIDTH, IMAGE_HEIGHT);

          // Caption
          ctx.fillStyle = theme.styles.captionColor;
          ctx.font = captionFontString;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.shadowColor = theme.styles.shadowColor;
          ctx.shadowBlur = 5;
          ctx.fillText(product.name, x + IMAGE_WIDTH / 2, y + IMAGE_HEIGHT + 15);
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;

        } catch (error) {
          console.error(`Failed to load image for product: ${product.name}`, error);
          // Draw a placeholder for failed images
          ctx.fillStyle = '#334155'; // slate-700
          ctx.fillRect(x, y, IMAGE_WIDTH, IMAGE_HEIGHT);
          ctx.fillStyle = '#94a3b8'; // slate-400
          ctx.font = '32px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('Image Error', x + IMAGE_WIDTH / 2, y + IMAGE_HEIGHT / 2);
        }
    } else {
        console.warn(`Image for product ${product.name} not found in DB.`);
        ctx.fillStyle = '#334155'; // slate-700
        ctx.fillRect(x, y, IMAGE_WIDTH, IMAGE_HEIGHT);
        ctx.fillStyle = '#94a3b8'; // slate-400
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Image Missing', x + IMAGE_WIDTH / 2, y + IMAGE_HEIGHT / 2);
    }
  }

  return canvas.toDataURL('image/png');
};