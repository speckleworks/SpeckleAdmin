<template>
  <md-card>
    <md-card-header>
      <md-card-header-text>
        <div class="md-title">Description</div>
      </md-card-header-text>
    </md-card-header>
    <md-card-content>
      <div v-show='!editDescription'>
        <div v-html='compiledDescription' style="background-color: #F4F4F4; padding:1px 15px;border-radius: 2px;"></div>
      </div>
      <div v-show='editDescription'>
        <a class='md-caption' href='https://en.wikipedia.org/wiki/Markdown#Example'>need some markdown help?</a>
        <md-field>
          <md-textarea v-model="stream.description"></md-textarea>
          <label>Markdown supported.</label>
        </md-field>
      </div>
    </md-card-content>
    <md-card-actions>
      <md-button class='md-primary' v-if='editDescription===false && canEdit' @click.native='editDescription=true'>Edit</md-button>
      <md-button class='md-primary' v-if='editDescription===true' @click.native='updateDescription'>Done</md-button>
    </md-card-actions>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'
import marked from 'marked'

export default {
  name: 'StreamDetailDescription',
  props: {
    stream: Object, // can be alert or info
  },
  computed: {
    compiledDescription( ) {
      return marked( this.stream.description, { sanitize: true } )
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
      editDescription: false
    }
  },
  methods: {
    updateDescription( ) {
      this.editDescription = false
      this.$store.dispatch( 'updateStream', { streamId: this.stream.streamId, description: this.stream.description } )
    },
  }
}

</script>
<style scoped lang='scss'>
</style>
