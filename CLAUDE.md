# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`brvm-backend` is a Node.js backend service. The project is in early development — the main entry point (`index.js`) and application logic have not yet been implemented.

## Key Facts

- **Runtime:** Node.js 20
- **Port:** 5000 (as configured in Dockerfile)
- **Entry point:** `index.js` (referenced in `package.json`)
- **Container:** Docker (`FROM node:20`, exposes port 5000)

## Commands

Once dependencies and scripts are added to `package.json`:

```bash
npm install       # Install dependencies
npm run build     # Build the project (script not yet defined)
npm run start     # Start the server (script not yet defined)
npm test          # Run tests (not yet configured)
```

To build and run via Docker:

```bash
docker build -t brvm-backend .
docker run -p 5000:5000 brvm-backend
```

## Current State

The `package.json` has no dependencies and only a placeholder test script. The Dockerfile expects `npm run build` and `npm run start` scripts that do not yet exist. Before the Docker image can be built, these gaps need to be filled:

1. Add actual dependencies (e.g., `express`) via `npm install <pkg>`
2. Define `build` and `start` scripts in `package.json`
3. Create `index.js` as the server entry point
