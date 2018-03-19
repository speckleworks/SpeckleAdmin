# speckle-admin
![image](https://user-images.githubusercontent.com/7696515/37546477-ed733a6a-2964-11e8-9b80-9448a88999bc.png)

> A simple admin ui for speckle users based on vue js and vuematerial.

Current functionality allows you to:
- search & filter your streams
- manage stream permissions
- edit stream names, etc
- archive & delete streams
- edit your profile on that speckle server

To start debugging locally, point your browser to `http://localhost:8080/?dev`. This will set the server to `http://localhost:3000/api`, where a default speckle server would run.

If your setup is different (ie, speckle server running at a different address), use the following steps: 

1. Open your browser's console and type `let settings = { serverUrl: "http://yourspeckleserver.com/api"} `. Hit enter.
2. Type `btoa(JSON.stringify(settings))` and hit enter.
3. Copy & paste the resulting string after a question mark in the url, for example: `http://localhost:8080/?eyJzZXJ2ZXJVcmwiOiJodHRwczovL3MwMDMuc3BlY2tsZS53b3Jrcy9hcGkLOL==`

The app will now direct all requests to `http://yourspeckleserver.com/api`. This mechanism is used in the application specific views, but can be re-purposed to more flexible debug uses, although it's quite complicated. 


## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```
