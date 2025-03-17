import http from 'http';
import fs from 'fs';
import path from 'path';
import translate from './translate.js';
import dotenv from 'dotenv';
dotenv.config();

const piaxes_alt_path = path.resolve('./piaxes_alt.js');
const public_path = path.resolve('./public');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/image-info') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', async () => {
      const timestamp = Date.now();
      const dynamicImportPath = `${piaxes_alt_path}?t=${timestamp}`;
      const piaxes_alt = (await import(dynamicImportPath)).default;

      const imageName = body;
      const alt = await translate(path.join(public_path, imageName)) || null;
      if (!alt) {
        res.end('erro ao carregar alt');
        return;
      }
      piaxes_alt[imageName] = alt;
      fs.writeFileSync(piaxes_alt_path, `export default ${JSON.stringify(piaxes_alt, null, 2)};`);
      res.end(alt);
    });
  } else {
    res.end('erro ao carregar alt');
  }
});

server.listen(4334, () => {
  console.log('Servidor iniciado na porta 4334');
});