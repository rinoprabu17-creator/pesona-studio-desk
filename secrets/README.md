# Local Secrets

Untuk OpenAI override lokal, buat file:

```bash
printf '%s\n' '<OPENAI_API_KEY>' > secrets/openai_api_key.txt
chmod 600 secrets/openai_api_key.txt
```

Aturan:

- Satu baris API key saja.
- Jangan commit `secrets/openai_api_key.txt`.
- Jangan paste API key ke chat, log, issue, atau dokumen.
- Default Docker Compose tidak memakai file ini; hanya `docker-compose.openai.yml` yang mount secret ke `campaign-planner-worker`.
