<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-text-field label="filter" v-model='filterText' hint='Search through the layers below' append-icon='filter_list' clearable></v-text-field>
      <v-card v-for='group in myFilteredGroups' :key='group.name' class='mb-3' v-if='group.objects.length>0'>
        <v-card-text>
          <v-layout align-center>
            <v-flex class='caption'>
              <b>{{group.name}}</b>&nbsp;<span class='font-weight-light'>({{group.objects.length}} objects)</span>
            </v-flex>
            <v-flex xs4 class='text-xs-right'>
              <v-btn icon small @click.native='toggleVisible(group.name)'>
                <v-icon>remove_red_eye</v-icon>
              </v-btn>
              <v-btn icon small @click.native='toggleIsolation(group.name)'>
                <v-icon>location_searching</v-icon>
              </v-btn>
            </v-flex>
          </v-layout>
        </v-card-text>
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
      if ( newVal !== oldVal ) {
        this.generateGroups( newVal )
        this.filterText = ''
        window.renderer.resetColors( )
        window.renderer.showObjects( [ ] )
      }
    }
  },
  computed: {
    myFilteredGroups( ) {
      let filteredGroups = {}
      if ( !this.filterText || this.filterText === '' ) return this.myGroups
      return this.myGroups.filter( gr => gr.name.toLowerCase( ).includes( this.filterText.toLowerCase( ) ) )
    }
  },
  data( ) {
    return {
      myGroups: [ ],
      loading: false,
      filterText: null
    }
  },
  methods: {
    generateGroups( key ) {
      this.myGroups = [ ]
      this.loading = true

      let groups = { orphans: { key: 'orphans', name: 'Orphaned Objects', objects: [ ], visible: true, isolated: false } }
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
              objects: [ obj._id ],
              visible: true,
              isolated: false
            }
          }
        } else {
          groups.orphans.objects.push( obj._id )
        }
        if ( index === this.$store.state.objects.length - 1 ) {
          this.loading = false
        }
      } )
      Object.keys( groups ).forEach( key => this.myGroups.push( groups[ key ] ) )
      // this.myGroups = groups
    },
    toggleVisible( groupName ) {
      let group = this.myGroups.find( gr => gr.name === groupName )
      if ( group.visible ) {
        window.renderer.hideObjects( group.objects )
        group.visible = false
      } else {
        window.renderer.showObjects( group.objects )
        group.visible = true
      }
    },
    toggleIsolation( groupName ) {
      let group = this.myGroups.find( gr => gr.name === groupName )
      if ( group.isolated ) {
        window.renderer.showObjects( [ ] )
        group.isolated = false
      } else {
        group.visible = true
        window.renderer.isolateObjects( group.objects )
        group.isolated = true
      }
    },
  }
}

</script>
<style scoped lang='scss'>
</style>
