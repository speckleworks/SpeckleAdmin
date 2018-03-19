<template>
  <md-content>
    <div class="spk-history-dialgoue">
      <md-app-toolbar class="md-primary md-dense">
        <div class="md-toolbar-section-start">
          <div class="md-toolbar-row">
            <md-button class='md-dense md-icon-button' @click='$emit("close")'>
              <md-icon>close</md-icon>
            </md-button>
            <p style=''>Stream Versioning</p>
          </div>
        </div>
      </md-app-toolbar>
      <div class="md-layout md-alignment-center-center">
        <div class="md-layout-item md-size-80">
          <br>
          <div class="md-layout md-alignment-center-center md-gutter" xxxv-if='users.length==0'>
            <div class="md-layout-item md-size-50 md-small-size-90">
              <h2 class='md-display-1'>
                This is a placeholder for future stream <strong>versioning</strong> functionality. 
              </h2>
              <p>
                Streams already have versioning enabled on them, through two methods in the api, namely cloning and diffing, and two fields, parent and the children array. The children array stores all the clones, or branches, that this stream had. The parent field keeps track of where the stream originated from. There's nothing stopping you from creating a new stream version, saving one and storing it for later, etc. 
              </p>
              <p>For example, here's the history of this stream:</p>
              <pre>Parent: {{stream.parent}}</pre>
              <pre>Children: {{stream.children}}</pre>
              <p><a href='https://github.com/speckleworks/SpeckleAdmin'>PRs welcome!</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </md-content>
</template>
<script>
export default {
  props: [ 'stream' ],
  computed: {},
  data( ) {
    return {}
  },
  methods: {},
  mounted( ) {}
}

</script>
<style lang="scss">
.spk-history-dialgoue {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 30000;
  background-color: white;
  overflow: scroll;
}

</style>
