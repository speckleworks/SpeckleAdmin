<template>
  <div class='md-layout'>
    <div class="md-layout-item md-size-100 md-layout md-alignment-center-left">
      <div class="md-layout-item md-size-20">
        <h3>Analyze:</h3>
      </div>
      <md-field class='md-layout-item md-size-50'>
        <label>Color objects by</label>
        <md-select v-model='selectedColorByKey' md-dense>
          <md-option v-for='key in propertyKeys' :value='key'>{{key}}</md-option>
        </md-select>
      </md-field>
      <div class='md-layout-item'>
        <md-button v-show='selectedColorByKey!==null' class='md-raised-xxx md-primary' @click.native='clearColorBy()'>clear</md-button>
      </div>
      <div class='md-layout-item md-size-100 md-caption' v-if='analysisLegend'>
        Found {{analysisLegend.objectCount}} objects sharing the <i>{{analysisLegend.propertyName}}</i> property. <br><span v-if='analysisLegend.isNumeric'>Its <strong>minimum</strong> is {{analysisLegend.min}} and it's <strong>maximum</strong> is {{analysisLegend.max}}.</span>
        <span v-else>Colours are randomly generated according to each value.</span>
      </div>
    </div>
    <div class="md-layout-item md-size-100">
      <h3>Data</h3>
      <p class='md-caption' v-if='selectedObjects.length === 0'>
        <strong>Total</strong> items: {{$store.state.objects.length}}. Now showing {{objects.length}}.
      </p>
      <p class='md-caption' v-else>
        <strong>Selected</strong> items: {{selectedObjects.length}}. Now showing {{objects.length}}.
      </p>
    </div>
    <div class="md-layout-item md-size-100" v-for='object in objects'>
      <object-detail-row :object='object'></object-detail-row>
    </div>
    <div class="md-layout-item md-size-100">
      <md-button class='md-raised btn-no-margin md-primary' style='width: 100%' @click.native='currentIndex+=paginationIncrement' :disabled='disableShowMoreButton'>
        Show More
      </md-button>
    </div>
    <!-- {{objects}} -->
  </div>
</template>
<script>
import flatten from 'flat'
import ObjectDetailRow from '@/components/ObjectDetailRow.vue'

export default {
  name: 'ObjectDataView',
  components: {
    ObjectDetailRow
  },
  props: {
    selectedObjects: {
      type: Array,
      default: ( ) => [ ]
    },
    analysisLegend: Object,
  },
  watch: {
    selectedColorByKey( newVal ) {
      renderer.resetColors( )
      if ( newVal !== null )
        renderer.colorByProperty( { propertyName: newVal } )
    },
    selectedObjects(){
      this.currentIndex = 25
    }
  },
  computed: {
    populatedSelectedObjects( ) {
      return this.selectedObjects.map( id => this.$store.state.objects.find( o => o._id === id ) )
    },
    objects( ) {
      if ( this.selectedObjects.length > 0 )
        return this.populatedSelectedObjects.slice( 0, this.currentIndex )
      return this.$store.state.objects.slice( 0, this.currentIndex )
    },
    propertyKeys( ) {
      let keySet = new Set( )
      this.$store.state.objects.forEach( obj => {
        if ( !obj.properties ) return
        let flatProps = flatten( obj.properties )
        for ( let key in flatProps )
          keySet.add( key )
      } )
      return [ ...keySet ]
    },
    disableShowMoreButton() {
      if( this.$store.state.objects.length === 0 ) return true
      if ( this.selectedObjects.length > 0 )
        return this.currentIndex > this.selectedObjects.length
      else
        return this.currentIndex > this.$store.state.objects.length
    }
  },
  data( ) {
    return {
      paginationIncrement: 25,
      currentIndex: 25,
      selectedColorByKey: null
    }
  },
  methods: {
    clearColorBy( ) {
      this.selectedColorByKey = null
    }
  },
  mounted( ) {

  }
}

</script>
<style scoped lang='scss'>
</style>
