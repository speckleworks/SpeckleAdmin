<template>
  <v-card class='mb-3'>
    <v-card-text>
      <v-layout row wrap>
        <v-flex xs12>{{stream.name}}</v-flex>
        <v-flex xs12 class='caption'>
          <v-icon small>fingerprint</v-icon> {{stream.streamId}}
          <v-icon small>{{stream.private ? "lock" : "lock_open"}}</v-icon>
          last changed <timeago :datetime='stream.updatedAt'></timeago>, created on {{new Date( stream.createdAt ).toLocaleString()}}
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-card-actions>
      <v-btn small>remove</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  name: 'HelloWorld',
  props: {
    stream: Object
  },
  computed: {},
  data( ) { return {} },
  methods: {}
}

</script>
<style scoped lang='scss'>
</style>
