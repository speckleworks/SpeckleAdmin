<template>
  <div class='md-layout'>
    <md-card class="md-elevation-0 md-layout-item md-size-100">
      <md-card-content>
        <h1 class='md-display-1'>Dashboard</h1>
        <p>Summary</p>
        <p>Your  latest streams</p>
        <p>Your  latest projects</p>
      </md-card-content>
    </md-card>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'HomeView',
  components: {
    HelloWorld
  }
}
</script>
