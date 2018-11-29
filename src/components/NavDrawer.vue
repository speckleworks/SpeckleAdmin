<template>
  <md-list>
    <md-list-item to='/'>
      <md-icon>home</md-icon>
      <span class="md-list-item-text">Home</span>
    </md-list-item>
    <md-list-item to='/streams'>
      <md-icon>import_export</md-icon>
      <span class="md-list-item-text">Streams</span>
    </md-list-item>
    <md-list-item to='/projects'>
      <md-icon>business</md-icon>
      <span class="md-list-item-text">Projects</span>
    </md-list-item>
    <md-list-item to='/profile'>
      <md-icon>account_circle</md-icon>
      <span class="md-list-item-text">Profile</span>
    </md-list-item>
  </md-list>
</template>
<script>
</script>
<style lang='scss'>
  $SpeckleBlue: #448aff;
  .nav-sidebar {
  width: 200px !important;
  background-color: $SpeckleBlue;
  padding-top: 30px;
}

a {
  color: white;
  transition: none !important;
}

a.is-active {
  background-color: white;
  color: $SpeckleBlue;
}
</style>
