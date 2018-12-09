<template>
  <md-card class='md-elevation-3'>
    <md-card-content>
      <div class="md-title">History</div>
      <md-divider md-inset></md-divider>
      Parent: {{stream.parent}}
      <md-divider md-inset></md-divider>
      Kids: {{stream.children}}
    </md-card-content>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'

export default {
  name: 'StreamDetailUserPerms',
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
  methods: {
  }
}

</script>
<style scoped lang='scss'>
</style>
