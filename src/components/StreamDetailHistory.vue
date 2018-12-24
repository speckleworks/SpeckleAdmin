<template>
  <div>
    <div v-if='false'></div>
    <div v-else>
      Stream has no history.
    </div>
  </div>
</template>
<script>
import debounce from 'lodash.debounce'
import StreamCardSmall from './StreamCardSmall.vue'

export default {
  name: 'StreamDetailHistory',
  components: { StreamCardSmall },
  props: {
    stream: Object, // can be alert or info
  },
  computed: {
    paginatedKids( ) {
      return this.stream.children.reverse().slice( this.startIndex, this.endIndex )
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
      startIndex: 0,
      itemsPerPage: 5,
      endIndex: 5
    }
  },
  methods: {}
}

</script>
<style scoped lang='scss'>
</style>
