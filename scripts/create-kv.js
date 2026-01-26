#!/usr/bin/env node

/**
 * 自动创建 Vercel KV 数据库的脚本
 *
 * 使用方法:
 * 1. 确保已登录 Vercel CLI (vercel whoami)
 * 2. 运行: node scripts/create-kv.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始创建 Vercel KV 数据库...\n');

// 读取项目配置
const vercelDir = path.join(__dirname, '..', '.vercel');
const projectJsonPath = path.join(vercelDir, 'project.json');

if (!fs.existsSync(projectJsonPath)) {
  console.error('❌ 错误: 项目未链接到 Vercel');
  console.error('请先运行: vercel link');
  process.exit(1);
}

const projectConfig = JSON.parse(fs.readFileSync(projectJsonPath, 'utf-8'));
const projectId = projectConfig.projectId;
const orgId = projectConfig.orgId;

console.log(`📦 项目 ID: ${projectId}`);
console.log(`🏢 组织 ID: ${orgId}\n`);

// 获取 Vercel Token
let token;
try {
  const configPath = path.join(
    process.env.HOME || process.env.USERPROFILE,
    '.vercel',
    'auth.json'
  );
  const authConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  token = authConfig.token;
} catch (error) {
  console.error('❌ 无法获取 Vercel 认证令牌');
  console.error('请确保已登录: vercel login');
  process.exit(1);
}

console.log('✅ 已获取认证令牌\n');

// 创建 KV 数据库
console.log('📝 创建 KV 数据库中...');

const createKVCommand = `curl -X POST "https://api.vercel.com/v1/storage/kv/stores" \
  -H "Authorization: Bearer ${token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "prompts-kv",
    "teamId": "${orgId}"
  }'`;

try {
  const result = execSync(createKVCommand, { encoding: 'utf-8' });
  const kvStore = JSON.parse(result);

  if (kvStore.error) {
    console.error('❌ 创建失败:', kvStore.error.message);
    process.exit(1);
  }

  console.log('✅ KV 数据库创建成功!');
  console.log(`   Store ID: ${kvStore.id}\n`);

  // 连接 KV 到项目
  console.log('🔗 连接 KV 数据库到项目...');

  const linkCommand = `curl -X POST "https://api.vercel.com/v1/storage/kv/stores/${kvStore.id}/link" \
    -H "Authorization: Bearer ${token}" \
    -H "Content-Type: application/json" \
    -d '{
      "projectId": "${projectId}",
      "environment": ["production", "preview", "development"]
    }'`;

  const linkResult = execSync(linkCommand, { encoding: 'utf-8' });
  const linkResponse = JSON.parse(linkResult);

  if (linkResponse.error) {
    console.error('❌ 连接失败:', linkResponse.error.message);
    process.exit(1);
  }

  console.log('✅ KV 数据库已成功连接到项目!\n');

  // 拉取新的环境变量
  console.log('📥 拉取最新环境变量...');
  execSync('vercel env pull .env.local --yes', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  console.log('\n🎉 配置完成!');
  console.log('✅ KV 数据库已创建并连接');
  console.log('✅ 环境变量已更新到 .env.local');
  console.log('\n下一步: 运行 vercel --prod 重新部署');

} catch (error) {
  console.error('❌ 执行失败:', error.message);
  process.exit(1);
}
