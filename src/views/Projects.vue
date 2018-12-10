<template>
  <div>
    <md-empty-state md-icon="business" md-label="" md-description="By creating a project, you'll be able to group streams together and share them with a team." v-if='projects.length === 0'>
      <md-button class="md-primary md-raised" @click.native='createProject'>Create your first project!</md-button>
    </md-empty-state>
    <div class='md-layout' v-else>
      <div class='md-layout-item md-small-size-100 md-medium-size-50 md-large-size-50 md-xlarge-size-33' v-for='project in projects'>
        <project-card  :resource='project'></project-card>
      </div>
    </div>
  </div>
</template>
<script>
import ProjectCard from '../components/ProjectCard.vue'

export default {
  name: 'ProjectsView',
  components: {
    ProjectCard
  },
  computed: {
    projects( ) {
      return this.$store.state.projects
    }
  },
  data( ) {
    return {

    }
  },
  methods: {
    createProject( ) {
      this.$store.dispatch( 'createProject' )
    }
  },
  created( ) {
    this.$store.dispatch( 'getProjects' )
  }
}

</script>
<style scoped lang='scss'>
</style>
