<template>
  <md-list>
    <!--     <md-list-item to='/'>
      <md-icon>home</md-icon>
      <span class="md-list-item-text">Home</span>
    </md-list-item> -->
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
  /*background-color: $SpeckleBlue !important;*/
  /*background-color: ghostwhite !important;*/
  padding-top: 30px;
}

ul {
  background-color: transparent !important;
}

/*.md-list-item-text{
  color: white !important;
  transition: none !important;
}
.is-active * {
  color: white !important;
}*/

</style>
