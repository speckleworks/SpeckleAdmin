<template>
  <md-card class='md-elevation-3' md-with-hover>
    <md-card-header class='bg-ghost-white'>
      <md-card-header-text>
        <div class="md-title">Network</div>
        <div class="md-caption">Where this stream is received and sent from.</div>
      </md-card-header-text>
    </md-card-header>
    <md-card-content>
      <br>
      <client-card v-for='client in clients' :key='client._id' :client='client'></client-card>
    </md-card-content>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'
import ClientCard from './ClientCard.vue'
export default {
  name: 'StreamDetailNetwork',
  components: { ClientCard },
  props: {
    stream: Object,
  },
  watch: {
    stream( newStream, oldStream ) {
      console.log( "wathc", newStream )
      this.fetchData( )
    }
  },
  computed: {
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    },
    clients( ) {
      return this.$store.getters.streamClients( this.stream.streamId )
    }
  },
  methods: {
    fetchData( ) {
      this.$store.dispatch( 'getStreamClients', { streamId: this.stream.streamId } )
    }
  },
  created( ) {
    this.fetchData( )
    // console.log( "created network:", this.stream )
  }
}

</script>
<style scoped lang='scss'>
</style>
