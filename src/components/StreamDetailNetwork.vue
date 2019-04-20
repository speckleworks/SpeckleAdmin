<template>
  <v-card class='elevation-0'>
    <v-toolbar dense class='elevation-0 title font-weight-light'>
      Source
    </v-toolbar>
    <!-- <div class="md-caption">Where this stream is originating from.</div> -->
    <v-card-text>
      <client-card v-for='client in senders' :key='client._id' :client='client'></client-card>
      <p v-if='senders.length===0'>There seem to be no source clients for this stream.</p>
    </v-card-text>
    <v-toolbar dense class='elevation-0 title font-weight-light'>
      Receivers
    </v-toolbar>
    <v-card-text>
      <client-card v-for='client in receivers' :key='client._id' :client='client'></client-card>
      <p v-if='receivers.length===0'>There seem to be no stream receivers.</p>
    </v-card-text>
  </v-card>
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
    senders( ) {
      if ( this.stream.onlineEditable )
        return [ {
          role: 'sender',
          documentType: '',
          documentName: 'Web UI',
          updatedAt: this.stream.updatedAt,
          owner: this.stream.owner
        } ]
      return this.$store.getters.streamClients( this.stream.streamId ).filter( c => c.role.toLowerCase( ) === 'sender' )
    },
    receivers( ) {
      return this.$store.getters.streamClients( this.stream.streamId ).filter( c => c.role.toLowerCase( ) === 'receiver' )
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
  }
}

</script>
<style scoped lang='scss'>
</style>
