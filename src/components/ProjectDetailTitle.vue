<template>
  <md-card class='md-elevation-0'>
    <h1 class='md-display-1'>
      <router-link to='/projects'>Projects</router-link> / {{project.name}}
    </h1>
    <p>
      projectId: <span style="user-select:all"><md-chip class='md-accent'><strong>{{project._id}}</strong></md-chip></span>
    </p>
    <md-divider></md-divider>
    <md-chips v-model="project.tags" @input='' md-placeholder="add tags" class='stream-chips' md-disabled='!canEdit'></md-chips>
  </md-card>
</template>
<script>
export default {
  name: 'HelloWorld',
  props: {
    project: Object
  },
  computed: {},
  data( ) { return {} },
  methods: {}
}

</script>
<style scoped lang='scss'>
</style>
