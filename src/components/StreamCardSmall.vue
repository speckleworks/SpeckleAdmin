<template>
  <md-card class='md-elevation-0' style='margin-bottom: 5px;' v-if='stream'>
    <md-card-content class='md-layout md-gutter md-alignment-center-left'>
      <div class="md-layout-item md-size-30">
        <router-link :to='"/streams/"+stream.streamId'>{{stream.name}}</router-link>
      </div>
      <div class="md-layout-item md-size-30 md-caption">
        {{stream.streamId}} | last update <strong><timeago :datetime='stream.updatedAt'></timeago></strong>
      </div>
      <div class="md-layout-item md-size-20 md-caption xx-text-center">
        <span v-for='tag in stream.tags'>{{tag}}</span>
      </div>
      <div class="md-layout-item text-right">
        <md-button class='md-dense-xxx md-icon-button md-accent'>
            <md-icon>delete</md-icon>
          </md-button>
      </div>
    </md-card-content>
  </md-card>
</template>
<script>
export default {
  name: 'StreamCardSmall',
  props: {
    streamId: String
  },
  computed: {
    stream( ) {
      return this.$store.state.streams.find( s => s.streamId === this.streamId )
    }
  },
  data( ) { return {} },
  methods: {}
}

</script>
<style scoped lang='scss'>
</style>
