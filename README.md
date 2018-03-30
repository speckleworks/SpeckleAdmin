# SpeckleAdmin
[![npm version](https://badge.fury.io/js/speckle-admin.svg)](https://badge.fury.io/js/speckle-admin)

A simple admin app for [speckle](https://speckle.works).

![image](https://user-images.githubusercontent.com/7696515/37546477-ed733a6a-2964-11e8-9b80-9448a88999bc.png)

## Current features:
- search & filter your streams
- manage stream permissions
- edit stream names, etc
- archive & delete streams
- edit your profile on that speckle server

## Roadmap:
The following api ([1.0.0-beta](https://speckleworks.github.io/SpeckleSpecs/)) need to be exposed:
- Stream History
- Stream Comments/Issues
- Projects
- User's Comments
- User's AssignedTo Comments

## Debugging

To start debugging locally, point your browser to `http://localhost:8080/?dev`. This will set the server to `http://localhost:3000/api`, where a default speckle server would run.

To set a different server url, edit `App.vue` and set your defaults in `mounted()`.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

## Build Standalone Component

You will need to add [poi](https://poi.js.org) globally, since `vue build` is now deprecated.

```bash
npm i -g poi
npm run build-component
```
