<template>
  <v-card :class="{'stream-card':true, 'elevation-5':selected, 'elevation-1': true}">
    <v-card-title>
      <span class='title font-weight-light'>{{stream.name ? stream.name : "Stream Has No Name"}}</span>
      <v-spacer></v-spacer>
      <span></span>
      <span>
        <v-checkbox color='primary' v-model="selected" value="1"></v-checkbox>
      </span>
    </v-card-title>
    <v-divider class='mx-0 my-0'></v-divider>
    <v-layout row wrap>
      <v-flex xs12 class='caption' ma-2>
        <v-icon small>edit</v-icon>&nbsp<timeago :datetime='stream.updatedAt'></timeago>&nbsp
        <v-icon small>access_time</v-icon>&nbsp {{createdAt}}&nbsp
        <v-icon small>{{stream.private ? "lock" : "lock_open"}}</v-icon> link sharing {{stream.private ? "off" : "on" }} &nbsp
        <v-icon small>person_outline</v-icon> {{ allUsers.length }}
      </v-flex>
      <v-flex xs12 ma-2 v-if='stream.tags.length > 0'>
        <v-chip small outline v-for='tag in stream.tags'>{{tag}}</v-chip>
      </v-flex>
      <v-flex xs12 ma-2>
        <div class="md-caption md-small-hide" v-html='compiledDescription'> </div>
      </v-flex>
    </v-layout>
    <!--     <md-card-content>
      <div class="md-layout md-alignment-center-center">
        <div class="md-layout-item md-size-10">
          <v-icon>access_time</v-icon>
        </div>
        <div class="md-layout-item md-caption">
          <strong>
            <timeago :datetime='stream.updatedAt'></timeago>
          </strong>
        </div>
        <div class="md-layout-item md-size-10">
          <v-icon>create</v-icon>
        </div>
        <div class="md-layout-item md-caption">
          {{createdAt}}
        </div>
        <div class='md-layout-item md-size-100 md-small-hide'>
          <md-chips v-model="stream.tags" @input='updateTags' md-placeholder="add tags" class='stream-chips'></md-chips>
        </div>
      </div>
    </md-card-content> -->
    <v-card-actions>
      <span class='caption font-weight-light'>Owned by {{owner}}</span>
      <v-spacer></v-spacer>
      <v-btn depressed class='transparent' @click.native='deleteStream' v-show='isOwner'>Archive</v-btn>
      <v-btn color='primary' :to='"/streams/"+stream.streamId'>Details</v-btn>
    </v-card-actions>
    <!-- {{stream.streamId}} -->
  </v-card>
</template>
<script>
import union from 'lodash.union'
import debounce from 'lodash.debounce'
import marked from 'marked'

export default {
  name: 'StreamCard',
  props: {
    stream: Object
  },
  watch: {
    selected( ) { this.$emit( "selected", this.stream ) }
  },
  computed: {
    createdAt( ) {
      let date = new Date( this.stream.createdAt )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    },
    compiledDescription( ) {
      return marked( this.stream.description.substring( 0, 220 ) + ' ...', { sanitize: true } )
    },
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    },
    allUsers( ) {
      return union( this.stream.canRead, this.stream.canWrite )
    },
    owner( ) {
      let u = this.$store.state.users.find( user => user._id === this.stream.owner )
      if ( !u ) {
        this.$store.dispatch( 'getUser', { _id: this.stream.owner } )
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
    deleteStream( ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, deleted: true } )
      this.$emit( 'deleted' )
    },
    updateTags: debounce( function( e ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, tags: this.stream.tags } )
    }, 1000 )
  },
  mounted( ) {
    bus.$on( 'unselect-all', ( ) => {
      this.selected = false
    } )
  }
}

</script>
<style scoped lang='scss'>
/*.stream-chips:after {
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
}*/

</style>
