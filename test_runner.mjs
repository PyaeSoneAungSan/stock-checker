import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('Starting Chrome with debugging port 9222...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(process.env.TEMP, 'chrome_cdp_profile_i18n_' + Date.now());

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    'http://127.0.0.1:8080/index.html'
  ], { stdio: 'ignore' });

  try {
    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
      await sleep(500);
      try {
        const res = await fetch('http://127.0.0.1:9222/json/list');
        const list = await res.json();
        if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
          wsUrl = list[0].webSocketDebuggerUrl;
          console.log('Found Chrome target:', list[0].title);
          break;
        }
      } catch (e) {
        // waiting
      }
    }

    if (!wsUrl) throw new Error('Could not connect to Chrome debugging port.');

    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const resp = JSON.parse(evt.data);
          if (resp.id === id) {
            ws.removeEventListener('message', handler);
            if (resp.error) reject(resp.error);
            else resolve(resp.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[Browser Error]', msg.params.exceptionDetails);
      }
    });

    await sendCommand('Runtime.enable');
    await sendCommand('Page.enable');

    console.log('Setting mobile viewport (390 x 844)...');
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
      hasTouch: true
    });
    await sendCommand('Emulation.setTouchEmulationEnabled', {
      enabled: true,
      maxTouchPoints: 5
    });

    await sleep(1500);

    // 1. Capture English Home Screenshot
    console.log('Capturing English Home View...');
    const enHomeShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_en_home.png', Buffer.from(enHomeShot.data, 'base64'));

    // 2. Switch to Burmese
    console.log('Switching to Burmese (မြန်မာစာ)...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-toggle-lang').click();
      `
    });
    await sleep(1000);

    // Capture Burmese Home Screenshot
    console.log('Capturing Burmese Home View...');
    const myHomeShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_burmese_home.png', Buffer.from(myHomeShot.data, 'base64'));

    // 3. Test Burmese WhatsApp Report Modal
    console.log('Opening Burmese WhatsApp Report Modal...');
    await sendCommand('Runtime.evaluate', {
      expression: `document.getElementById('btn-quick-report').click();`
    });
    await sleep(800);

    const reportShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_burmese_report.png', Buffer.from(reportShot.data, 'base64'));

    const reportText = await sendCommand('Runtime.evaluate', {
      expression: `document.getElementById('report-text-content').value;`,
      returnByValue: true
    });
    console.log('Generated Burmese WhatsApp Report:\n' + reportText.result?.value);

    // Close report modal
    await sendCommand('Runtime.evaluate', {
      expression: `document.querySelector('#report-modal [data-close-modal]').click();`
    });
    await sleep(500);

    // 4. Test Burmese Add Modal
    console.log('Opening Burmese Add Item Modal...');
    await sendCommand('Runtime.evaluate', {
      expression: `document.getElementById('btn-add-item').click();`
    });
    await sleep(800);

    const addShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_burmese_add.png', Buffer.from(addShot.data, 'base64'));

    // Close add modal
    await sendCommand('Runtime.evaluate', {
      expression: `document.querySelector('#item-form-modal [data-close-modal]').click();`
    });
    await sleep(500);

    // 5. Test search in Burmese: search for "ပါရာစီတမော"
    console.log('Testing search for "ပါရာစီတမော" (Panadol in Burmese)...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        const input = document.getElementById('search-input');
        input.value = 'ပါရာစီတမော';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      `
    });
    await sleep(800);

    const searchShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_burmese_search.png', Buffer.from(searchShot.data, 'base64'));

    ws.close();
    console.log('All English & Burmese mobile tests completed successfully!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

runTest().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
