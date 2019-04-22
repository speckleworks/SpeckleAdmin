<template>
  <v-card :class="{'elevation-10':selected, 'elevation-1': true}" :style="`opacity:${isOwner ? 1 : 0.20 };pointer-events:${isOwner ? 'all' : 'none'};`">
    <v-card-title>

      <span class='title font-weight-light'>{{resource.name ? resource.name : "No Name"}}</span>
      <v-spacer></v-spacer>
      <span></span>
      <span>
        <v-checkbox color='primary' v-model="selected"></v-checkbox>
      </span>
    </v-card-title>
    <v-divider class='mx-0 my-0'></v-divider>
    <v-layout row wrap>
      <v-flex xs12 class='caption' ma-2>
        <v-icon small>edit</v-icon>&nbsp;<timeago :datetime='resource.updatedAt'></timeago>&nbsp;
        <v-icon small>access_time</v-icon>&nbsp; {{createdAt}}&nbsp;
      </v-flex>
    </v-layout>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn depressed class='transparent' @click.native='' v-show='isOwner'>Delete Permanently</v-btn>
      <v-btn color='primary' :to='"/projects/"+resource._id'>Restore</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import debounce from 'lodash.debounce'
import uniq from 'lodash.uniq'
import union from 'lodash.union'
import marked from 'marked'

export default {
  name: 'ProjectCard',
  props: {
    resource: Object
  },
  watch: {
    selected( ) { this.$emit( "selected", this.resource ) }
  },
  computed: {
    project( ) {
      return this.resource
    },
    createdAt( ) {
      let date = new Date( this.project.createdAt )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    },
    canEdit( ) {
      return this.isOwner ? true : this.project.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.project.owner === this.$store.state.user._id
    }
  },
  data( ) {
    return {
      selected: false,
    }
  },
  methods: {
    archiveProject( ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, deleted: true } )
      // this.$store.dispatch( 'updateStream', { _id: this.project._id, deleted: true } )
      // this.$emit( 'deleted' )
    },
    updateTags: debounce( function( e ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, tags: this.project.tags } )
    }, 1000 )
  },
  mounted( ) {
    bus.$on( 'select-resource', id => {
      if ( id === this.resource._id ) this.selected = true
    } )
    bus.$on( 'unselect-all-resources', ( ) => {
      this.selected = false
    } )
  }
}

</script>
<style scoped lang='scss'>
</style>
