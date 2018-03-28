# SpeckleAdmin
![image](https://user-images.githubusercontent.com/7696515/37546477-ed733a6a-2964-11e8-9b80-9448a88999bc.png)

> A simple admin app for speckle users based on vue js and vuematerial.

Current functionality allows you to:
- search & filter your streams
- manage stream permissions
- edit stream names, etc
- archive & delete streams
- edit your profile on that speckle server

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
