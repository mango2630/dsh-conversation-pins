import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))

/**
 * Resolve esbuild from this package. `ESBUILD_PATH` remains an escape hatch
 * for packagers that already have esbuild outside the local node_modules.
 * @returns esbuild's module namespace.
 */
async function loadEsbuild() {
  if (process.env.ESBUILD_PATH) {
    const require = createRequire(import.meta.url)
    return require(resolve(process.env.ESBUILD_PATH))
  }
  try {
    return await import('esbuild')
  } catch (error) {
    throw new Error('esbuild is not installed. Run `pnpm install` before `pnpm build`.', { cause: error })
  }
}

const esbuild = await loadEsbuild()
const result = await esbuild.build({
  entryPoints: [join(root, 'src/client.tsx')],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  sourcemap: false,
  legalComments: 'none',
  external: ['react', 'react/jsx-runtime'],
  define: { 'process.env.NODE_ENV': '"production"' },
})

const body = result.outputFiles[0].text
const banner = [
  `window.__ModuleLoader__.load({ id: ${JSON.stringify(manifest.name)}, factory: (require) => {`,
  'var module = { exports: {} };',
  'var exports = module.exports;',
].join('\n')
const footer = [
  'return module.exports;',
  '} });',
  '',
].join('\n')
await writeFile(join(root, 'lib/client.js'), `${banner}\n${body}\n${footer}`)
console.log(`built lib/client.js (${(Buffer.byteLength(body) / 1024).toFixed(1)} KiB)`)
