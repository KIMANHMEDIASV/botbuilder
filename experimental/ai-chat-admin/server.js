const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3978;
const modelsFile = path.join(__dirname, 'data', 'models.json');
const publicDir = path.join(__dirname, 'public');

async function readModels() {
  try {
    const raw = await fs.readFile(modelsFile, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

async function writeModels(models) {
  await fs.writeFile(modelsFile, JSON.stringify(models, null, 2));
}

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function validateModel(payload) {
  const { name, description, endpointUrl } = payload;
  return Boolean(name && description && endpointUrl);
}

async function serveStatic(res, urlPath) {
  const safePath = path.normalize(urlPath).replace(/^\\+/, '');
  const filePath = path.join(publicDir, safePath || 'index.html');

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8'
    }[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (error) {
    res.writeHead(404);
    res.end('Not found');
  }
}

async function handleApi(req, res, url) {
  if (req.method === 'GET' && url.pathname === '/api/models') {
    const models = await readModels();
    return sendJson(res, 200, models);
  }

  if (req.method === 'POST' && url.pathname === '/api/models') {
    const body = await readBody(req);
    const payload = JSON.parse(body || '{}');

    if (!validateModel(payload)) {
      return sendJson(res, 400, { message: 'name, description, and endpointUrl are required' });
    }

    const models = await readModels();
    const newModel = {
      id: payload.id || crypto.randomUUID(),
      name: payload.name,
      description: payload.description,
      endpointUrl: payload.endpointUrl
    };

    if (models.find((model) => model.id === newModel.id)) {
      return sendJson(res, 409, { message: 'Model with this id already exists' });
    }

    models.push(newModel);
    await writeModels(models);
    return sendJson(res, 201, newModel);
  }

  if (req.method === 'PUT' && url.pathname.startsWith('/api/models/')) {
    const id = url.pathname.split('/').pop();
    const body = await readBody(req);
    const payload = JSON.parse(body || '{}');

    if (!validateModel(payload)) {
      return sendJson(res, 400, { message: 'name, description, and endpointUrl are required' });
    }

    const models = await readModels();
    const index = models.findIndex((model) => model.id === id);
    if (index === -1) {
      return sendJson(res, 404, { message: 'Model not found' });
    }

    const updatedModel = {
      ...models[index],
      name: payload.name,
      description: payload.description,
      endpointUrl: payload.endpointUrl
    };

    models[index] = updatedModel;
    await writeModels(models);
    return sendJson(res, 200, updatedModel);
  }

  if (req.method === 'DELETE' && url.pathname.startsWith('/api/models/')) {
    const id = url.pathname.split('/').pop();
    const models = await readModels();
    const nextModels = models.filter((model) => model.id !== id);

    if (nextModels.length === models.length) {
      return sendJson(res, 404, { message: 'Model not found' });
    }

    await writeModels(nextModels);
    res.writeHead(204);
    return res.end();
  }

  if (req.method === 'POST' && url.pathname === '/api/chat') {
    const body = await readBody(req);
    const payload = JSON.parse(body || '{}');
    const { modelId, message } = payload;

    if (!modelId || !message) {
      return sendJson(res, 400, { message: 'modelId and message are required' });
    }

    const models = await readModels();
    const model = models.find((entry) => entry.id === modelId);
    if (!model) {
      return sendJson(res, 404, { message: 'Model not found' });
    }

    const reply = `Using ${model.name} (endpoint: ${model.endpointUrl}), I received: ${message}`;
    return sendJson(res, 200, { reply, model });
  }

  res.writeHead(404);
  res.end('Not found');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith('/api/')) {
    try {
      await handleApi(req, res, url);
    } catch (error) {
      console.error('API error', error);
      sendJson(res, 500, { message: 'Unexpected server error' });
    }
    return;
  }

  const staticPath = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\//, '');
  await serveStatic(res, staticPath);
});

server.listen(PORT, () => {
  console.log(`AI chat admin sample running on http://localhost:${PORT}`);
});
