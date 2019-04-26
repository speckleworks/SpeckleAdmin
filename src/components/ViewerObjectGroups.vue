<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-text-field label="filter" v-model='filterText' hint='Search through the layers below' append-icon='filter_list' clearable></v-text-field>
      <v-card v-for='group in myFilteredGroups' :key='group.name' :class='`mb-3 ${ group.isolated ? "elevation-15" : "elevation-1"} ${ group.visible ? "elevation-1" : "elevation-0" }`' v-if='group.objects.length>0'>
        <v-card-text>
          <v-layout align-center>
            <v-flex xs1>
              <v-avatar size="20" :color="getHexFromString(group.name)"></v-avatar>
            </v-flex>
            <v-flex class='caption'>
              <b>{{group.name}}</b>&nbsp;<span class='font-weight-light'>({{group.objects.length}} objects)</span>
            </v-flex>
            <v-flex xs4 class='text-xs-right'>
              <v-btn flat icon small @click.native='toggleVisible(group.name)' :color='group.visible ? "":"grey"'>
                <v-icon>remove_red_eye</v-icon>
              </v-btn>
              <v-btn flat icon small @click.native='toggleIsolation(group.name)' :color='group.isolated ? "":"grey"'>
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
        window.renderer.colorByProperty( { propertyName: newVal } )
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
        group.isolated = true
        window.renderer.isolateObjects( group.objects )
      }

      this.myGroups.forEach( gr => {
        if ( gr.name === groupName ) return
        if ( group.isolated ) {
          gr.isolated = false
          gr.visible = false
        } else {
          gr.visible = true
          window.renderer.showObjects( gr.objects )
        }
      } )
    },
  }
}

</script>
<style scoped lang='scss'>
</style>
