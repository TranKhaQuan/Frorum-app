const express = require('express');
const client = require('prom-client');

const app = express();
const PORT = 3000;

app.use(express.json());

// Middleware ghi log request ra stdout (để Promtail & Loki bắt)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Tích hợp Prometheus Metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new client.Counter({
  name: 'forum_http_requests_total',
  help: 'Tong so luong request HTTP vao Forum',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

// Endpoint cho Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// APIs Diễn đàn
app.get('/', (req, res) => res.send('Welcome to Forum API!'));
app.get('/api/topics', (req, res) => res.json([{ id: 1, name: 'Thao luan chung' }, { id: 2, name: 'Lap trinh Node.js' }]));
app.get('/api/posts', (req, res) => res.json([{ id: 1, topic_id: 1, title: 'Bai viet dau tien', content: 'Xin chao moi nguoi!' }]));
app.get('/api/users', (req, res) => res.json([{ id: 1, username: 'admin' }, { id: 2, username: 'khaquan' }]));

// API POST tao bai viet moi
app.post('/api/posts', (req, res) => {
  const { title, content } = req.body;
  res.status(201).json({ message: 'Tao bai viet thanh cong!', data: { title, content } });
});

app.listen(PORT, () => console.log(`Forum App running on port ${PORT}`));
