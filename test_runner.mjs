import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('Starting Chrome with debugging port 9222...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(process.env.TEMP, 'chrome_cdp_profile_sec_' + Date.now());

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

    // 1. Capture Multi-section Home Screen
    console.log('Capturing Multi-section Home View (DIY, Med, Groceries, Snacks)...');
    const homeShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_multi_sections.png', Buffer.from(homeShot.data, 'base64'));

    // 2. Open Section Manager Modal
    console.log('Opening Section Manager Modal...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-open-add-section-tab').click();
      `
    });
    await sleep(800);

    const secShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_section_manager.png', Buffer.from(secShot.data, 'base64'));

    // 3. Create a new custom section: "Stationery" / "စာရေးကိရိယာ", icon: "✏️"
    console.log('Creating new custom section: Stationery / စာရေးကိရိယာ...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        document.getElementById('input-sec-name-en').value = 'Stationery';
        document.getElementById('input-sec-name-my').value = 'စာရေးကိရိယာ';
        document.getElementById('input-sec-icon').value = '✏️';
        document.getElementById('input-sec-color').value = 'indigo';
        document.getElementById('new-section-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      `
    });
    await sleep(600);

    // Close section manager modal
    await sendCommand('Runtime.evaluate', {
      expression: `document.querySelector('#section-manager-modal [data-close-modal]').click();`
    });
    await sleep(500);

    // 4. Open Add Item Modal and verify new section is in the options
    console.log('Opening Add Item Modal to check dynamic section selector...');
    await sendCommand('Runtime.evaluate', {
      expression: `document.getElementById('btn-add-item').click();`
    });
    await sleep(800);

    const addShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_add_with_sections.png', Buffer.from(addShot.data, 'base64'));

    // Close add modal
    await sendCommand('Runtime.evaluate', {
      expression: `document.querySelector('#item-form-modal [data-close-modal]').click();`
    });
    await sleep(500);

    // 5. Test switching to Groceries tab
    console.log('Testing Groceries tab filter...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        const grocTab = document.querySelector('[data-section-id="Groceries"]');
        if (grocTab) grocTab.click();
      `
    });
    await sleep(800);

    const grocShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_groceries_tab.png', Buffer.from(grocShot.data, 'base64'));

    ws.close();
    console.log('Multi-category testing completed successfully!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

runTest().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
