#!/usr/bin/env node
// Executa um arquivo SQL no projeto Supabase via Management API
// Uso: SUPABASE_ACCESS_TOKEN=xxx node scripts/run-sql.js scripts/arquivo.sql

const fs = require('fs');

const token = process.env.SUPABASE_ACCESS_TOKEN;
const file  = process.argv[2];
const ref   = 'mioraguwwwtfvwcbyeaw';

if (!token) {
  console.error('Faltando SUPABASE_ACCESS_TOKEN.');
  console.error('Obtenha em: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

if (!file) {
  console.error('Uso: SUPABASE_ACCESS_TOKEN=xxx node scripts/run-sql.js <arquivo.sql>');
  process.exit(1);
}

const sql = fs.readFileSync(file, 'utf8');

fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
})
  .then(async r => {
    const data = await r.json();
    if (!r.ok) {
      console.error('Erro:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
    console.log('OK:', JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error('Falha na requisição:', err.message);
    process.exit(1);
  });
