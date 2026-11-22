import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest() {
  console.log('Starting Chrome with debugging port 9222...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.join(process.env.TEMP, 'chrome_cdp_profile_' + Date.now());

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
          console.log('Found Chrome target:', list[0].title, list[0].url);
          break;
        }
      } catch (e) {
        // waiting for chrome to listen
      }
    }

    if (!wsUrl) {
      throw new Error('Could not connect to Chrome debugging port.');
    }

    const ws = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    console.log('Connected to CDP via WebSocket!');

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

    // Capture console messages
    ws.addEventListener('message', (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        console.log('[Browser Console]', msg.params.type, ...msg.params.args.map(a => a.value || a.description));
      } else if (msg.method === 'Runtime.exceptionThrown') {
        console.error('[Browser Error]', msg.params.exceptionDetails);
      }
    });

    await sendCommand('Runtime.enable');
    await sendCommand('Page.enable');

    // Emulate Mobile Device: iPhone 12/13/14 (390 x 844, 3x DPR, mobile touch)
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

    // Wait for DOM to render completely
    await sleep(1500);

    // 1. Take initial home screen screenshot
    console.log('Capturing mobile screenshot (Home view)...');
    const homeShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_home_view.png', Buffer.from(homeShot.data, 'base64'));
    console.log('Saved mobile_home_view.png');

    // 2. Test Search interaction: search for "Panadol"
    console.log('Testing search for "Panadol"...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        const input = document.getElementById('search-input');
        input.value = 'Panadol';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      `
    });
    await sleep(600);
    const searchShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_search_view.png', Buffer.from(searchShot.data, 'base64'));
    console.log('Saved mobile_search_view.png');

    // Clear search
    await sendCommand('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-clear-search').click();
      `
    });
    await sleep(500);

    // 3. Test Cycle Stock Status: click first stock cycle button
    console.log('Testing Stock Status Cycle button tap...');
    const cycleResult = await sendCommand('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('[data-action="cycle-stock"]');
        const beforeText = btn ? btn.innerText : 'not found';
        btn.click();
        const afterText = btn ? btn.innerText : 'not found';
        JSON.stringify({ beforeText, afterText });
      `,
      returnByValue: true
    });
    console.log('Cycle status result:', cycleResult.result?.value);
    await sleep(600);

    // 4. Test Toggle Price Tag button
    console.log('Testing Price Tag Toggle tap...');
    const tagResult = await sendCommand('Runtime.evaluate', {
      expression: `
        const btn = document.querySelector('[data-action="toggle-price-tag"]');
        const beforeText = btn ? btn.innerText : 'not found';
        btn.click();
        const afterText = btn ? btn.innerText : 'not found';
        JSON.stringify({ beforeText, afterText });
      `,
      returnByValue: true
    });
    console.log('Price tag toggle result:', tagResult.result?.value);
    await sleep(600);

    // 5. Test Filter Chip: "Expiring Soon" (<90d)
    console.log('Testing "Tarikh Luput (<90h)" filter chip...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        const chip = document.querySelector('[data-filter-id="expiring"]');
        if (chip) chip.click();
      `
    });
    await sleep(600);
    const expiringShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_expiring_filter.png', Buffer.from(expiringShot.data, 'base64'));
    console.log('Saved mobile_expiring_filter.png');

    // Reset filter to 'all'
    await sendCommand('Runtime.evaluate', {
      expression: `
        const chip = document.querySelector('[data-filter-id="all"]');
        if (chip) chip.click();
      `
    });
    await sleep(500);

    // 6. Test WhatsApp Report Modal
    console.log('Opening WhatsApp Report Modal...');
    await sendCommand('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-quick-report').click();
      `
    });
    await sleep(700);
    const reportShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_whatsapp_modal.png', Buffer.from(reportShot.data, 'base64'));
    console.log('Saved mobile_whatsapp_modal.png');

    // Get report content text
    const reportText = await sendCommand('Runtime.evaluate', {
      expression: `document.getElementById('report-text-content').value;`,
      returnByValue: true
    });
    console.log('Generated WhatsApp Report:\n' + reportText.result?.value);

    // Close report modal
    await sendCommand('Runtime.evaluate', {
      expression: `document.querySelector('#report-modal [data-close-modal]').click();`
    });
    await sleep(500);

    // 7. Test Add / Edit Modal
    console.log('Opening Add Item Modal...');
    await sendCommand('Runtime.evaluate', {
      expression: `document.getElementById('btn-add-item').click();`
    });
    await sleep(700);
    const addShot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('mobile_add_modal.png', Buffer.from(addShot.data, 'base64'));
    console.log('Saved mobile_add_modal.png');

    // Close add modal
    await sendCommand('Runtime.evaluate', {
      expression: `document.querySelector('#item-form-modal [data-close-modal]').click();`
    });
    await sleep(500);

    ws.close();
    console.log('CDP testing completed successfully!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

runTest().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
