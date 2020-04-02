# SpeckleAdmin Plugins!
This folder is scanned for components that will be added dynamically to SpeckleAdmin's `/plugins` route.
* Only components that have the prefix `plugin-` will be added, so it's important that your component follow this naming pattern! 
* We parse PascalCase to kebabCase to get the route path, so make sure your Vue component is named appropriately. 
* E.g. a Vue component with filename `plugin-FirstPlugin.vue` and a `name: 'FirstPlugin'` property will be served at `/plugins/first-plugin`

## An Example Plugin:
To add this plugin, create a file called `plugin-ExamplePlugin.vue` in the `src/plugins` folder. Add the following code.
```
<template>
  <div class='display-1 ma-5 pa-5'>Hi, {{$store.state.user.name}}. Welcome to Plugin A</div>
</template>
<script>
export default {
  name: 'PluginB',
  manifest: {
    humanReadableName: "Plugin A",
    description: "Something witty.",
    requireAuth: false,
    icon: "flight_land", // from: https://material.io/resources/icons/
    registerInNav: true
  },
  created( ) {
    console.log( 'Plugin A created!' )
  }
}
</script>
```
