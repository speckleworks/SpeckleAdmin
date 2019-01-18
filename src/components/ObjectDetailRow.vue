<template>
  <md-card class='md-layout-xx object-row md-elevation-0 md-gutter' md-with-hover ref='rowdiv'>
    <div class="md-layout-item md-size-10 row-cell">
      <strong>Type:</strong> {{object.type}}
    </div>
    <div class="md-layout-item row-cell" v-for='kvp in limitKvps'>
      <strong><span class='md-caption'>{{kvp.key}}:</span></strong> {{ kvp.value }}
    </div>
    <div class="md-layout-item row-cell row-slide xxx-md-elevation-1">
      <a href="javascript:void(0)" @click='scrollLeft()'><md-icon>chevron_left</md-icon></a>
      <a href="javascript:void(0)" @click='scrollReset()'><md-icon style='color:#EFEFEF'>fiber_manual_record</md-icon></a>
      <a href="javascript:void(0)" @click='scrollRight()'><md-icon>chevron_right</md-icon></a>
      <!-- <a href="javascript:void(0)" ><md-icon>chevron_right</md-icon></a> -->
    </div>
  </md-card>
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
      sliceEnd: 5
    }
  },
  methods: {
    scrollReset( ) {
      this.sliceStart = 0
      this.sliceEnd = 5
    },
    scrollLeft( ) {
      if ( this.sliceStart > 0 ) {
        this.sliceStart -= 1
        this.sliceEnd -= 1
      } else {
        this.sliceStart = this.kvps.length - 5
        this.sliceEnd = this.kvps.length
      }
    },
    scrollRight( ) {
      if ( this.sliceEnd < this.kvps.length ) {
        this.sliceStart += 1
        this.sliceEnd += 1
      } else {
        this.sliceStart = 0
        this.sliceEnd = 5
      }
    }
  }
}

</script>
<style scoped lang='scss'>
.row-slide {
  position: absolute;
  background-color: white;
  /*background-color: black;*/
  right: 0;
}

.object-row {
  margin-left: 0;
  margin-right: 0;
  padding-left: 10px;
  border-bottom: 1px solid #F1F1F1;
  height: 50px;
  width: auto;
  line-height: 50px;
  white-space: nowrap;
  overflow: hidden;
}

/*.object-row:hover{
  overflow: auto;
}*/
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
  /*float: left;*/
  border-right: 1px solid #F1F1F1;
}

</style>
