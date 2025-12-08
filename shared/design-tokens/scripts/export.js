import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultSource = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'planning',
  'mobile',
  'tokens.json'
);
const destination = path.resolve(__dirname, '..', 'tokens', 'tokens.json');

async function main() {
  const sourcePath = process.env.SOURCE_TOKENS_PATH
    ? path.resolve(process.env.SOURCE_TOKENS_PATH)
    : defaultSource;

  try {
    await fs.access(sourcePath);
  } catch (error) {
    console.error(`Source tokens not found at ${sourcePath}`);
    process.exit(1);
  }

  const raw = await fs.readFile(sourcePath, 'utf8');
  let tokens;
  try {
    tokens = JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse tokens JSON');
    console.error(error);
    process.exit(1);
  }

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, JSON.stringify(tokens, null, 2));
  console.log(`Tokens copied from ${sourcePath} to ${destination}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
