<template>
  <md-card md-with-hover :class="{'stream-card':true, 'selected':selected}">
    <md-card-header @click='selected=!selected'>
      <md-card-header-text>
        <div class="md-title"><router-link :to='`/streams/${stream.streamId}`'>{{stream.name}}</router-link></div>
        <div class="md-subhead" stlye='user-select:all;'>{{stream.streamId}}</div>
      </md-card-header-text>
      <md-button class='md-icon-button' @click.native='removeStream()'>
        <md-icon>close</md-icon>
      </md-button>
    </md-card-header>
    <md-card-content>
      <p>Created on: <strong>{{createdAt}}</strong></p>
      <p>Modified on: <strong>{{createdAt}}</strong></p>
      <p>Units: <strong>{{stream.baseProperties.units}}</strong></p>
      {{stream.description}}
    </md-card-content>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'
import marked from 'marked'

export default {
  name: 'StreamCard',
  props: {
    stream: Object
  },
  watch: {
    selected( ) { this.$emit( "selected", this.stream ) }
  },
  computed: {
    owner( ) {
      return this.$store.state.users.find( u => u._id === stream.owner )
    },
    createdAt( ) {
      let date = new Date( this.stream.createdAt )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    },
    compiledDescription( ) {
      return marked( this.stream.description.substring( 0, 220 ) + ' ...', { sanitize: true } )
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
      selected: false,
    }
  },
  methods: {
    removeStream( ) {
      this.$emit( 'remove-stream', this.stream.streamId )
    }
  },
  mounted( ) {}
}

</script>
<style scoped lang='scss'>
.stream-card {
  margin-bottom: 20px;
}

</style>
