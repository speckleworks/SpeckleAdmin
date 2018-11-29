<template>
  <md-card md-with-hover :class="{'stream-card':true, 'selected':selected}">
    <md-card-header @click='selected=!selected'>
      <md-card-header-text>
        <div class="md-title">{{stream.name}}</div>
        <div class="md-subhead" stlye='user-select:all;'>{{stream.streamId}}</div>
        <div class="md-caption">{{stream.description}}</div>
      </md-card-header-text>
      <md-checkbox v-model="selected" value="1" @click.native='$emit("selected", stream)'></md-checkbox>
    </md-card-header>
    <md-card-content>
      <div class="md-layout md-alignment-center-center">
        <div class="md-layout-item md-size-10">
          <md-icon>access_time
            <md-tooltip md-direction="bottom">
              Last updated
            </md-tooltip>
          </md-icon>
        </div>
        <div class="md-layout-item md-caption">
          <!-- {{stream.updatedAt}} -->
          <strong><timeago :datetime='stream.updatedAt'></timeago></strong>
        </div>
        <div class="md-layout-item md-size-10">
          <md-icon>create
            <md-tooltip md-direction="bottom">
              Created on
            </md-tooltip>
          </md-icon>
        </div>
        <div class="md-layout-item md-caption">
          {{createdAt}}
        </div>
        <div class="md-layout-item md-caption">
          <md-icon>{{stream.private ? 'https' : 'public'}}</md-icon>
          Stream is {{stream.private?'private':'public'}}.
        </div>
        <div class='md-layout-item md-size-100'>
          <md-chips v-model="stream.tags" md-placeholder="Tags"></md-chips>
        </div>
      </div>
    </md-card-content>
    <md-card-actions>
      <md-button class='md-accent'>Delete</md-button>
      <md-button class='md-raised-xxx'>More...</md-button>
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
  watch: {
    selected( ) {
      console.log( "wtf" )
      this.$emit( "selected", this.stream )
    }
  },
  computed: {
    createdAt( ) {
      let date = new Date( this.stream.createdAt )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    }
  },
  data( ) {
    return {
      selected: false,
    }
  },
  mounted( ) {
    bus.$on( 'unselect-all', ( ) => {
      this.selected = false
    } )
  }
}

</script>
<style scoped lang='scss'>
.md-card-header {
  /*cursor: pointer;*/
}

.stream-card {
  margin-bottom: 20px;
}

.selected {
  background-color: #CCCCCC !important;
}

i {
  color: #4C4C4C;
}

</style>
