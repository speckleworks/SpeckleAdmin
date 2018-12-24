<template>
  <md-card class='md-elevation-0 title-card'>
    <md-card-content>
      <h1 class='md-display-1'>
        <router-link to='/streams'>Streams</router-link> /
        <editable-span v-if='canEdit && stream.onlineEditable' :text='stream.name' @update='updateName'></editable-span>
        <span v-else>{{stream.name}}</span>
      </h1>
      <p>
        <span ><md-chip class='md-primary'>streamId: <strong style="user-select:all; cursor: pointer;">{{stream.streamId}}</strong></md-chip></span>&nbsp
        <md-chip class=''>
          <span v-if='canEdit'><md-icon>lock_open</md-icon> you can edit.</span>
          <span v-else><md-icon>lock</md-icon> you cannot edit.</span>
        </md-chip>
      </p>
      <md-divider></md-divider>
      <md-chips v-model="stream.tags" @input='updateTags' md-placeholder="add tags" class='stream-chips' md-disabled='!canEdit'></md-chips>
    </md-card-content>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'

export default {
  name: 'StreamDetailTitle',
  props: {
    stream: Object, // can be alert or info
  },
  computed: {
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    },
    streamProjects( ) {
      return this.$store.state.projects.filter( p => p.streams.indexOf( this.stream.streamId ) !== -1 )
    }
  },
  data( ) {
    return {}
  },
  methods: {
    updateTags: debounce( function( e ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, tags: this.stream.tags } )
    }, 1000 ),
    updateName( args ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, name: args.text } )
    }
  },
  mounted( ) {}
}

</script>
<style scoped lang='scss'>
.title-card {
  margin-left: 0;
  margin-right: 0;
}

.md-card-content:last-of-type {
  padding-bottom: 0px !important;
}

</style>
