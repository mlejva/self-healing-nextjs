import dotenv from 'dotenv'
dotenv.config()

import readline from 'readline';
import { Sandbox, CommandHandle } from 'e2b'

const nextjsPort = 3000
const sbx = await Sandbox.create('zyf5223sc1shsfan5jkl')
let startCmd: CommandHandle

const url = `https://${sbx.getHost(nextjsPort)}`
console.log(`Nextjs app URL: ${url}`)


async function connectToStartCmd() {
  const cmds = await sbx.commands.list()
  //
  // Find start command based on the `tag` field which should be `startCmd
  const startCmdInfo = cmds.find(cmd => cmd.tag === 'startCmd')
  if (!startCmdInfo) {
    throw new Error('Start command not found')
  }
  console.log('\nStart command found:\n------------\n', startCmdInfo, '\n-------------')
  startCmd = await sbx.commands.connect(startCmdInfo?.pid, {
    onStdout: (data) => {
      console.log('\x1b[32m[next server output]\x1b[0m', data)
    },
    onStderr: (data) => {
      console.error('\x1b[31m[next server error]\x1b[0m', data)
}
  })
}

await connectToStartCmd()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

let inputLines: string[] = [];

console.log('Enter custom code to overwrite app.tsx. Press Enter twice to submit:');

rl.on('line', async (input) => {
  if (input.trim() === '') {
    // User pressed Enter on an empty line, submit the text
    const submittedCode = inputLines.join('\n')
    await sbx.files.write('/home/user/pages/_app.tsx', submittedCode)
    console.log('Code submitted')
    inputLines = []; // Reset for next input
  } else {
    // Collect the input line
    inputLines.push(input);
  }
});


// Wait for user to press Ctrl+C to kill the sandbox
process.on('SIGINT', async () => {
  console.log('\nKilling sandbox and stopping...');
  await sbx.kill();
  console.log('sandbox killed')
  process.exit();
});
