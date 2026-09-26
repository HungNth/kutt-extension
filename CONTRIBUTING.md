## Contributing Guidelines

## Architecture

- Connects to self-hosted [Kutt](https://github.com/thedevs-network/kutt) instances using API v2.

## Development

- `npm install` to install dependencies.
- To watch file changes in developement

  - Chrome
    - `npm run dev:chrome`
  - Firefox
    - `npm run dev:firefox`

  (Reload Extension Manually in the browser)

- Load extension in browser

  - ### Chrome

    - Go to the browser address bar and type `chrome://extensions`
    - Check the `Developer Mode` button to enable it.
    - Click on the `Load Unpacked Extension…` button.
    - Select your extension’s extracted directory.

      <img width="400" src="https://i.imgur.com/dJRL7By.png" />

  - ### Firefox

    - Load the Add-on via `about:debugging` as temporary Add-on.
    - Choose the `manifest.json` file in the extracted directory

      <img width="400" src="https://i.imgur.com/aAL5dQg.png" />

- Configure your self-hosted Kutt Instance URL and API Key in the extension's options page.

`npm run build` builds the extension for all the browsers to `extension/(browser)` directory respectively.

## Testing

Download latest `Release`

[<img src=".github/assets/direct-download.png"
alt="Direct download"
height="50">](https://github.com/thedevs-network/kutt-extension/releases)

