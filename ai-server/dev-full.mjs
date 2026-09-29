import { spawn } from 'node:child_process'

const run = (name, command, args) => {
  const child = spawn(command, args, {
    cwd: process.cwd(),
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (data) => {
    process.stdout.write(`[${name}] ${data}`)
  })

  child.stderr.on('data', (data) => {
    process.stderr.write(`[${name}] ${data}`)
  })

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`)
    }
  })

  return child
}

const ai = run('ai', 'node', ['ai-server/server.mjs'])
const web = run('web', 'vite', [])

const shutdown = () => {
  ai.kill()
  web.kill()
  process.exit()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
