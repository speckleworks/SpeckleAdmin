<template>
  <div class='row-container' @mouseover='hover()' @mouseleave='unhover()' @click='zoomTo()'>
    <md-card class='md-layout-xx object-row md-elevation-0 md-gutter' md-with-hover ref='rowdiv'>
      <div class="md-layout-item md-size-10 row-cell">
        <strong>Type:</strong> {{object.type}}
      </div>
      <div class="md-layout-item row-cell" v-for='kvp in limitKvps'>
        <strong><span class='md-caption'>{{kvp.key}}:</span></strong> {{ kvp.value }}
      </div>
    </md-card>
  </div>
</template>
<script>
import flatten from 'flat'
export default {
  name: 'ObjectDetailRow',
  props: {
    object: Object,
  },
  computed: {
    limitKvps( ) {
      return this.kvps.slice( this.sliceStart, this.sliceEnd )
    },
    kvps( ) {
      let kvps = [ ]
      let flatProps = flatten( this.object.properties )
      for ( let key in flatProps )
        kvps.push( { key: key, value: flatProps[ key ] } )
      return kvps
    }
  },
  data( ) {
    return {
      sliceStart: 0,
      sliceEnd: 50,
      isHovering: false
    }
  },
  methods: {
    hover( ) {
      if ( this.isHovering ) return
      this.isHovering = true
      renderer.highlightObjects( [ this.object._id ] )
      console.log( 'hover', this.object._id )
    },
    unhover( ) {
      if ( !this.isHovering ) return
      this.isHovering = false
      renderer.unHighlightObjects( [ this.object._id ] )
      console.log( 'unhover', this.object._id )
    },
    zoomTo() {
      renderer.zoomToObject( this.object._id )
    }
  }
}

</script>
<style scoped lang='scss'>
.object-row {
  margin-left: 0;
  margin-right: 0;
  padding-left: 10px;
  border-bottom: 1px solid #F1F1F1;
  height: 50px;
  line-height: 50px;
  white-space: nowrap;
  overflow: hidden;
}

.object-row:hover {
  overflow-x: auto;
}

.row-cell:first-of-type {
  padding-left: 0;
}

.row-cell {
  min-width: 0;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 8px;
  padding-right: 8px;
  display: inline-block;
  border-right: 1px solid #F1F1F1;
}

</style>
