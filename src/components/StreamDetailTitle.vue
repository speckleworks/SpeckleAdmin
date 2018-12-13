<template>
  <md-card class='md-elevation-0'>
    <md-card-content>
      <h1 class='md-display-1'>
        <router-link to='/streams'>Streams</router-link> / {{stream.name}}
      </h1>
      <!-- <md-divider></md-divider> -->
      <p>StreamId: <span style="user-select:all"><strong>{{stream.streamId}}</strong></span></p>
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
