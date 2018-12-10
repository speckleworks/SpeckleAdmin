<template>
  <md-card class='md-elevation-3'>
    <md-card-content>
      <div class="md-title">Network</div>
      <md-divider md-inset></md-divider>
      <p>TODO</p>
    </md-card-content>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'
// TODO:
// watch is useful for setting up on direct page entering
// created is useful when loading this comp up from the stream list
export default {
  name: 'StreamDetailUserPerms',
  props: {
    stream: Object,
  },
  watch: {
    stream( newStream, oldStream ) {
      console.log( "wathc", newStream )
    }
  },
  computed: {
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    }
  },
  methods: {},
  created( ) {
    console.log( "created:", this.stream )
  }
}

</script>
<style scoped lang='scss'>
</style>
