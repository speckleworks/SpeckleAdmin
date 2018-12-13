<template>
  <md-card class='md-elevation-3'>
    <md-card-header class='bg-ghost-white'>
      <md-card-header-text>
        <div class="md-title">History</div>
        <div class="md-caption">This stream's children and parents, if any.</div>
      </md-card-header-text>
    </md-card-header>
    <!-- <md-card-content> -->
      <md-card class='md-elevation-0'>
        <md-card-content>
          <div class="md-title">Parent</div>
        </md-card-content>
      </md-card>
      <stream-card-small :stream-id='stream.parent' v-if='stream.parent' :removable='false'></stream-card-small>
      <md-card class='md-elevation-0' v-else>
        <md-card-content>
          <div class="md-caption">This stream is a parent stream.</div>
        </md-card-content>
      </md-card>
      <md-card class='md-elevation-0'>
        <md-card-content>
          <div class="md-title">Children <span class='md-caption'>({{stream.children.length}})</span></div>
        </md-card-content>
      </md-card>
      <md-card class='md-elevation-0' v-if='stream.children.length === 0'>
        <md-card-content>
          <div class="md-caption">This stream has no children.</div>
        </md-card-content>
      </md-card>
      <stream-card-small v-for='childId in paginatedKids' :key='childId' :stream-id='childId' :removable='false'></stream-card-small>
      <br>
      <md-button class='md-raised md-primary' @click.native='endIndex+=5' :disabled='paginatedKids.length===stream.children.length'>
          Show More ({{paginatedKids.length}} / {{stream.children.length}})
        </md-button>
    <!-- </md-card-content> -->
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'
import StreamCardSmall from './StreamCardSmall.vue'

export default {
  name: 'StreamDetailUserHistory',
  components: { StreamCardSmall },
  props: {
    stream: Object, // can be alert or info
  },
  computed: {
    paginatedKids() {
      return this.stream.children.slice( this.startIndex, this.endIndex )
    },
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    }
  },
  data() {
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
