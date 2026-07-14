import { defineConfig, loadEnv } from 'vite';

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('request-too-large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function buildDeepSeekMessages(payload) {
  return [
    {
      role: 'system',
      content: [
        '你是资深产品设计师和 UI 提示词架构师。',
        '请把输入的 UI/PRD/链接分析信息，改写成可直接复制到 Codex、Figma Make 和通用 AI 工具的高质量提示词。',
        '必须返回 JSON，不要输出 Markdown，不要解释。',
      ].join('\n'),
    },
    {
      role: 'user',
      content: JSON.stringify({
        output_schema: {
          codex: '中文，面向生成可运行网页/App UI 的详细提示词',
          figmaMake: 'English, for Figma Make, concise but complete',
          general: '中文，通用 UI 生成提示词',
        },
        constraints: [
          '保留输入里的布局、颜色、内容、组件、交互和响应式重点',
          '不要编造不可见的品牌、业务数据或图片细节',
          '如果是图片来源，只能基于已提供的尺寸、主色、方向、密度等本地分析摘要来写',
          '输出必须是合法 JSON：{"codex":"...","figmaMake":"...","general":"..."}',
        ],
        input: payload,
      }),
    },
  ];
}

function deepseekAnalyzePlugin() {
  return {
    name: 'promptly-deepseek-api',
    configureServer(server) {
      server.middlewares.use('/api/analyze-ui', async (req, res) => {
        if (req.method !== 'POST') {
          sendJson(res, 405, { error: 'method-not-allowed' });
          return;
        }

        const env = loadEnv(server.config.mode, process.cwd(), '');
        const apiKey = env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;
        const model = env.DEEPSEEK_MODEL || process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

        if (!apiKey) {
          sendJson(res, 501, { error: 'deepseek-not-configured' });
          return;
        }

        try {
          const payload = JSON.parse(await readBody(req));
          const upstream = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages: buildDeepSeekMessages(payload),
              response_format: { type: 'json_object' },
              thinking: { type: 'disabled' },
              max_tokens: 2800,
              stream: false,
            }),
          });

          const data = await upstream.json().catch(() => ({}));
          if (!upstream.ok) {
            sendJson(res, upstream.status, { error: 'deepseek-request-failed', detail: data?.error?.message || data });
            return;
          }

          const content = data?.choices?.[0]?.message?.content || '{}';
          const parsed = JSON.parse(content);
          sendJson(res, 200, {
            promptByTarget: {
              Codex: parsed.codex || '',
              'Figma Make': parsed.figmaMake || '',
              通用: parsed.general || '',
            },
            model,
            usage: data.usage || null,
          });
        } catch (error) {
          sendJson(res, 500, { error: 'analyze-ui-failed', detail: error.message });
        }
      });
    },
  };
}

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
  },
  plugins: [deepseekAnalyzePlugin()],
});
