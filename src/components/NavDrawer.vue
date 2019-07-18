<template>
  <div>
    <v-list v-if='$store.state.isAuth' two-line class='pa-0'>
      <v-list-tile to='/'>
        <v-list-tile-action>
          <v-icon>home</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Home</v-list-tile-title>
          <v-list-tile-sub-title class='font-weight-light caption'>Everything at a glance.</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/streams'>
        <v-list-tile-action>
          <v-icon>import_export</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Streams</v-list-tile-title>
          <v-list-tile-sub-title class='font-weight-light caption'>Create and manage your streams.</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/projects'>
        <v-list-tile-action>
          <v-icon>business</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Projects</v-list-tile-title>
          <v-list-tile-sub-title class='font-weight-light caption'>Group your data and share it with others.</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/trash'>
        <v-list-tile-action>
          <v-icon>delete_outline</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Archive</v-list-tile-title>
          <v-list-tile-sub-title class='font-weight-light caption'>The good old recycle bin.</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile v-if='$store.state.user.role==="admin"' to='/admin'>
        <v-list-tile-action>
          <v-icon>settings</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Admin</v-list-tile-title>
          <v-list-tile-sub-title class='font-weight-light caption'>Server administration</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-divider class='ma-3'></v-divider>
      <v-list-tile to='/view'>
        <v-list-tile-action>
          <v-icon>360</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Viewer</v-list-tile-title>
          <v-list-tile-sub-title class='font-weight-light caption'>View Things! In Dimensions! With 3D!</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-divider class='ma-3'></v-divider>
    </v-list>
    <v-list v-if='$store.state.isAuth'>
      <v-list-tile to='/profile'>
        <v-list-tile-action>
          <v-icon>face</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Profile</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/plugins'>
        <v-list-tile-action>
          <v-icon>category</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Plugins</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/feedback'>
        <v-list-tile-action>
          <v-icon>feedback</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Feedback</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile>
        <v-list-tile-action>
          <v-icon>developer_board</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-sub-title class='font-weight-light caption'>You're connected at {{$store.state.serverManifest.serverName}}<br>{{$store.state.server}}</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
    <v-list v-else three-line>
      <v-list-tile to='/login'>
        <v-list-tile-action>
          <v-icon>face</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Login</v-list-tile-title>
          <v-list-tile-sub-title>If you already have an account, login here!</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile to='/register'>
        <v-list-tile-action>
          <v-icon>add</v-icon>
        </v-list-tile-action>
        <v-list-tile-content>
          <v-list-tile-title>Register</v-list-tile-title>
          <v-list-tile-sub-title>If you don't have an account, create one here!</v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </div>
</template>
<script>
export default {
  name: 'SiteNavigation'
}

</script>
<style lang='scss'>
</style>
