<template>
  <md-card class='md-elevation-0'>
    <md-card-content>
      <h1 class='md-display-1'>
        {{stream.name}}
      </h1>
      <p>StreamId: <span style="user-select:all"><strong>{{stream.streamId}}</strong></span></p>
      <span class="md-caption" v-if='isOwner'>You own this stream.</span>
      <span class="md-caption" v-if='!isOwner'>This stream was shared with you by <strong>{{streamOwner}}</strong> | </span>
      <span class="md-caption" v-if='canEdit'>You have write access.</span>
      <span class="md-caption" v-if='!canEdit'>You don't have write access.</span>
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
    streamOwner( ) {
      if ( this.isOwner ) return `${this.$store.state.user.name} ${this.$store.state.user.surname}`
      let owner = this.$store.state.users.find( user => user._id === this.stream.owner)
      if(!owner)  return '(loading)'
      return `${owner.name} ${owner.surname} ${owner.company ? "(" + owner.company + ")" : ''}`
  },
  canEdit( ) {
    return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
  },
  isOwner( ) {
    return this.stream.owner === this.$store.state.user._id
  }
},
data( ) {
    return {
    }
  },
  methods: {
    updateTags: debounce( function( e ) {
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, tags: this.stream.tags } )
    }, 1000 ),
  },
  mounted( ) {  }
}

</script>
<style scoped lang='scss'>
</style>
