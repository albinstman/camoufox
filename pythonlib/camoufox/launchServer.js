// Launches a Playwright BrowserServer for Camoufox from Python, without using
// the Node.js Playwright library directly.
//
// camoufox/server.py runs this script with the working directory set to
// Playwright's bundled driver package (`<driver>/package`), so requiring that
// directory loads playwright-core's PUBLIC API. We use the public
// `firefox.launchServer()` entry point rather than reaching into Playwright
// internals: the previous implementation required `./lib/browserServerImpl.js`,
// which Playwright REMOVED in 1.60.0 (folded into coreBundle.js), breaking the
// server on every Playwright >=1.60. The public surface is stable across
// versions (verified 1.51 through 1.61).

const { firefox } = require(process.cwd());

function collectData() {
    return new Promise((resolve) => {
        let data = '';
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', (chunk) => {
            data += chunk;
        });

        process.stdin.on('end', () => {
            resolve(JSON.parse(Buffer.from(data, "base64").toString()));
        });
    });
}

collectData().then((options) => {
    console.time('Server launched');
    console.info('Launching server...');

    // Call Playwright's public `launchServer` method.
    firefox.launchServer(options).then(browserServer => {
        console.timeEnd('Server launched');
        console.log('Websocket endpoint:\x1b[93m', browserServer.wsEndpoint(), '\x1b[0m');
        // Continue forever
        process.stdin.resume();
    }).catch(error => {
        console.error('Error launching server:', error.message);
        process.exit(1);
    });
}).catch((error) => {
    console.error('Error collecting data:', error.message);
    process.exit(1);  // Exit with error code
});
