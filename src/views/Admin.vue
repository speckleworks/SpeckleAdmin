<template>
  <v-container grid-list-xl>
    <v-layout row wrap>
      <v-flex xs12 py-5 class='headline font-weight-light'>
        Manage Users, Projects, and Streams for this Speckle Server.
      </v-flex>
      <v-flex xs12>
        <v-tabs v-model="active" grow class='pa-0 ma-0' slider-color='primary'>
          <v-tab key="Users" ripple :to='{name:"admin users"}'>
            Users
          </v-tab>
          <v-tab key="Streams" ripple :to='{name:"admin streams"}'>
            Streams
          </v-tab>
          <v-tab key="Projects" ripple :to='{name:"admin projects"}'>
            Projects
          </v-tab>
        </v-tabs>
        <router-view></router-view>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script>
import debounce from 'lodash.debounce'
import ProjectCard from '../components/ProjectCard.vue'

export default {
  name: 'ProjectsView',
  components: {
    ProjectCard
  },
  computed: {
    projects( ) {
      return this.$store.state.projects.filter( p => p.deleted === false )
    },
    filteredProjects( ) {
      if ( this.searchfilter && this.searchfilter !== '' )
        return this.projects.filter( p => p.name.toLowerCase().includes( this.searchfilter.toLowerCase() ) )
      return this.projects
    },
    paginatedProjects( ) {
      return this.filteredProjects.slice( this.currentIndex + this.pageNumber * this.sliceSize, this.sliceSize * ( this.pageNumber + 1 ) )
    }
  },
  data( ) {
    return {
      currentIndex: 0,
      sliceSize: 6,
      pageNumber: 0,
      searchfilter: '',
      selectedProjects: [ ],
      isSearching: false,
      active: null
    }
  },
  methods: {
    selectThis( project ) {
      let index = this.selectedProjects.findIndex( p => p._id === project._id )
      if ( index === -1 )
        this.selectedProjects.unshift( project )
      else
        this.selectedProjects.splice( index, 1 )
    },
    selectAll( ) {
      this.paginatedProjects.forEach( project => {
        let index = this.selectedProjects.findIndex( s => s._id === project._id )
        if ( index === -1 ) {
          bus.$emit( 'select-project', project._id )
        }
      } )
    },
    createProject( ) {
      this.$store.dispatch( 'createProject', { name: 'A brand new speckle project' } )
        .then( res => {
          this.$router.push( `/projects/${res._id}` )
        } )
    },
    deleteSelectedProjects( ) {
      this.selectedProjects.forEach( project => {
        this.$store.dispatch( 'updateProject', { _id: project._id, deleted: true } )
      } )
      this.clearSelection( )
    },
    clearSelection( ) {
      bus.$emit( 'unselect-all-projects' )
    },
    updateSearch: debounce( function( e ) {
      this.pageNumber = 0
      this.isSearching = false
      this.searchfilter = e
    }, 1000 ),
  },
  created( ) {}
}

</script>
<style scoped lang='scss'>
</style>
