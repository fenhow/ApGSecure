# Secure Login App

## Overview
This app creates a tokenized login gateway for linking to protected URLs. The token is one-time-use and expires after being used.

## Setup on Render

1. Create a free account at [Render.com](https://render.com).
2. Create a new Web Service.
3. Connect this repo or upload the zipped folder.
4. Set the build and start command to:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

## Managing Users

Edit `users.json` to add/remove users:
```json
{
  "fenwick": {
    "password": "supersecure",
    "url": "https://example.com/secret-page"
  }
}
```

Save and redeploy to apply changes.