<template>
  <md-card md-with-hover class='stream-card'>
    <md-card-header>
      <md-card-header-text>
        <div class="md-title">{{stream.name}}</div>
        <div class="md-subhead" stlye='user-select:all'>{{stream.streamId}}</div>
        <div class="md-caption">{{stream.description}}</div>
      </md-card-header-text>
    </md-card-header>
    <md-card-content>
      <div class="md-layout md-alignment-center-center">
        <div class="md-layout-item md-size-10">
          <md-icon>access_time</md-icon>
        </div>
        <div class="md-layout md-caption">
          <!-- {{stream.updatedAt}} -->
          <strong><timeago :datetime='stream.updatedAt'></timeago></strong>
          <md-tooltip md-direction="bottom">
            Last updated
          </md-tooltip>
        </div>
        <div class="md-layout-item md-size-10">
          <md-icon>create</md-icon>
        </div>
        <div class="md-layout md-caption">
          {{createdAt}}
        </div>
      </div>
    </md-card-content>
    <md-card-actions>
      <md-button>Edit</md-button>
    </md-card-actions>
    <!-- {{stream.streamId}} -->
  </md-card>
</template>
<script>
export default {
  name: 'StreamCard',
  props: {
    stream: Object
  },
  computed: {
    createdAt() {
      let date = new Date( this.stream.createdAt )
      return date.toLocaleString('en', { year: 'numeric', month: 'long', day: 'numeric' })
    }
  }
}

</script>
<style scoped lang='scss'>
.stream-card {
  margin-bottom: 20px;
}
i {
  color: #4C4C4C;
}

</style>
