import fs from 'fs';
import path from 'path';
import sharp from "sharp";

const imageTypes = RegExp(/\.(png|jpe?g)$/i);
const piaxes_alt_path = path.resolve('../../piaxes_alt.js');

function searchImagesInDirRecursive(dir) {
  const files = fs.readdirSync(dir);
  const images = [];

  files.forEach((filename) => {
    const file = path.join(dir, filename);
    if (imageTypes.test(file)) {
      images.push(file);
    } else if (fs.statSync(file).isDirectory()) {
      images.push(...searchImagesInDirRecursive(file));
    }
  });
  return images;
}

export default function PiaxesVite() {
  return {
    name: 'piaxes-plugin',
    buildStart() {
      const piaxes_alt = {};
      if (!fs.existsSync(piaxes_alt_path))
        fs.writeFileSync(piaxes_alt_path, `export default ${JSON.stringify(piaxes_alt, null, 2)};`);
    },
    async closeBundle() {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve, reject) => { 
        try {
          const dist = path.resolve('dist');

          const images = searchImagesInDirRecursive(dist);

          for (const image of images) {
            const imageBuffer = fs.readFileSync(image);
            const webp = await sharp(imageBuffer).webp().toBuffer();
            const avif = await sharp(imageBuffer).avif().toBuffer();
            fs.writeFileSync(image.replace(imageTypes, '.webp'), webp);
            fs.writeFileSync(image.replace(imageTypes, '.avif'), avif);
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
  };
}