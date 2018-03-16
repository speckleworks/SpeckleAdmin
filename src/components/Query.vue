<template>
  <md-content>
    <div class="spk-query-dialgoue">
      <md-app-toolbar class="md-primary md-dense">
        <div class="md-toolbar-section-start">
          <div class="md-toolbar-row">
            <md-button class='md-dense md-icon-button' @click='$emit("close")'>
              <md-icon>close</md-icon>
            </md-button>
            <p style=''>Stream Query</p>
          </div>
        </div>
      </md-app-toolbar>
      <div class="md-layout md-alignment-center-center">
        <div class="md-layout-item md-size-80">
          <br>
          <div class="md-layout md-alignment-center-center md-gutter" xxxv-if='users.length==0'>
            <div class="md-layout-item md-size-50 md-small-size-90">
              <h2 class='md-display-1'>
                This is a placeholder for future stream <strong>querying</strong> functionality. 
              </h2>
              <p>
                This should be an amazing by which you should be easily able to assemble a query against this stream, essentially a "filter" for the objects in the stream. 
              </p>
              <p>
                It should help you do things like "Give me all the objects of this type and that type, exclude this, and please give me just these properties", thus allowing for easy reporting and scheduling.
              </p>
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
  props: [ ],
  computed: {},
  data( ) {
    return {}
  },
  methods: {},
  mounted( ) {}
}

</script>
<style lang="scss">
.spk-query-dialgoue {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3000;
  background-color: white;
  overflow: scroll;
}

</style>
