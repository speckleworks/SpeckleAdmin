<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-text-field label="filter" v-model='filterText' hint='Search through the layers below' append-icon='filter_list' clearable></v-text-field>
      <v-card v-for='group in myGroups' :key='group.name' class='mb-3'>
        <v-card-text>{{group.name}} | {{group.objects.length}}</v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import get from 'lodash.get'
export default {
  name: 'ObjectGroups',
  props: {
    groupKey: { type: String }
  },
  watch: {
    groupKey( newVal, oldVal ) {
      if ( newVal !== oldVal )
        this.generateGroups( newVal )
    }
  },
  computed: {},
  data( ) {
    return {
      myGroups: [ ],
      loading: false,
      filterText: null
    }
  },
  methods: {
    generateGroups( key ) {
      let groups = {}
      this.loading = true
      this.$store.state.objects.forEach( ( obj, index ) => {
        let propValue = get( obj.properties, key )
        if ( propValue ) {
          // if we have the group already
          if ( groups.hasOwnProperty( propValue ) ) {
            groups[ propValue ].objects.push( obj._id )
          } else {
            groups[ propValue ] = {
              key: key,
              name: propValue,
              objects: [ obj._id ]
            }
          }
        }
        if ( index === this.$store.state.objects.length - 1 ) {
          this.loading = false
        }
      } )
      this.myGroups = groups
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
