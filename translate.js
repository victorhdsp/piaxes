import { GoogleGenerativeAI } from "@google/generative-ai";
import sharp from 'sharp';
import fs from 'fs';

let genAI;

const prompt = 'Veja essa imagem e crie um alt focado em pessoas cegas, seguindo as boas práticas de acessibilidade e regras do Brasil.';

async function getCorrectMetadata(imagePath) {
  let base64;
  const mimeType = imagePath.split('.').pop();

  if (mimeType != "png") {
    base64 = await sharp(imagePath)
      .png()
      .toBuffer();
    return { base64: base64.toString('base64'), mimeType: 'image/png' };
  } else {
    base64 = fs.readFileSync(imagePath, { encoding: 'base64' });
    return { base64, mimeType: 'image/png' };
  }
}

async function fetchGemini(base64, mimeType) {
  try {
    if (!genAI)
      genAI = new GoogleGenerativeAI(process.env.PIAXES_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });
    const {response} = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: mimeType
        }
      },
      prompt
    ]);
    return response.text();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function translate(imagePath) {
  if (!process.env.PIAXES_GEMINI_API_KEY)
    return null;
  const { base64, mimeType } = await getCorrectMetadata(imagePath);
  const alt = await fetchGemini(base64, mimeType);
  return alt;
}

export default translate;