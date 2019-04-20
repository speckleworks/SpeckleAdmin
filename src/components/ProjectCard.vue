<template>
  <v-card :class="{'elevation-10':selected, 'elevation-1': true}">
    <v-card-title>
      <span class='title font-weight-light'>{{resource.name ? resource.name : "Stream Has No Name"}}</span>
      <v-spacer></v-spacer>
      <span></span>
      <span>
        <v-checkbox color='primary' v-model="selected"></v-checkbox>
      </span>
    </v-card-title>
    <v-divider class='mx-0 my-0'></v-divider>
    <v-layout row wrap>
      <v-flex xs12 class='caption' ma-2>
        <v-icon small>import_export</v-icon>&nbsp<strong style="user-select:all">{{project.streams.length}}</strong>&nbsp;
        <v-icon small>person_outline</v-icon> {{ allUsers.length }} &nbsp;
        <v-icon small>edit</v-icon>&nbsp;<timeago :datetime='resource.updatedAt'></timeago>&nbsp;
        <v-icon small>access_time</v-icon>&nbsp; {{createdAt}}&nbsp;
      </v-flex>
      <v-flex xs12 ma-2 v-if='resource.tags.length > 0'>
        <v-chip small outline v-for='tag in resource.tags'>{{tag}}</v-chip>
      </v-flex>
      <v-flex xs12 ma-2>
        <div class="md-caption md-small-hide" v-html='compiledDescription'> </div>
      </v-flex>
    </v-layout>
    <v-card-actions>
      <span class='caption font-weight-light'>Owned by <strong>{{owner}}</strong></span>
      <v-spacer></v-spacer>
      <v-btn depressed class='transparent' @click.native='archiveProject' v-show='isOwner'>Archive</v-btn>
      <v-btn color='primary' :to='"/projects/"+resource._id'>Details</v-btn>
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
    selected( ) { this.$emit( "selected", this.project ) }
  },
  computed: {
    project( ) {
      return this.resource
    },
    projectTeamMembers( ) {
      return union( this.project.canRead, this.project.canWrite )
    },
    createdAt( ) {
      let date = new Date( this.project.createdAt )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    },
    compiledDescription( ) {
      return marked( this.project.description.substring( 0, 400 ) + ' ...', { sanitize: true } )
    },
    canEdit( ) {
      return this.isOwner ? true : this.project.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.project.owner === this.$store.state.user._id
    },
    allUsers( ) {
      return union( this.project.canRead, this.project.canWrite )
    },
    owner( ) {
      let u = this.$store.state.users.find( user => user._id === this.resource.owner )
      if ( !u ) {
        this.$store.dispatch( 'getUser', { _id: this.resource.owner } )
      }
      return u ? u.surname.includes( "is you" ) ? `you` : `${u.name} ${u.surname}` : 'Loading'
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
    bus.$on( 'select-project', id => {
      if ( id === this.project._id ) this.selected = true
    } )
    bus.$on( 'unselect-all-projects', ( ) => {
      this.selected = false
    } )
  }
}

</script>
<style scoped lang='scss'>
.stream-chips:after {
  display: none !important;
}

.stream-chips:before {
  display: none !important;
}

.md-card-actions,
.md-card-header {
  background: ghostwhite;
}

.md-card-header {
  margin-bottom: 10px;
}

.stream-chips {
  margin-bottom: 0;
}

.stream-chips input {
  font-size: 10px;
}

.stream-card {
  margin-bottom: 20px;
}

i {
  color: #4C4C4C;
}

</style>
