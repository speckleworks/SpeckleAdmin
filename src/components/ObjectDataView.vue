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
      <md-button v-show='selectedColorByKey!==null' class='md-raised-xxx md-primary' @click.native='clearColorBy()'>clear</md-button>
    </div>
    <div class="md-layout-item md-size-100">
      <h3>Data</h3>
      <p class='md-caption'>Total items: {{$store.state.objects.length}}. Now showing {{objects.length}}.</p>
    </div>
    <div class="md-layout-item md-size-100" v-for='object in objects'>
      <object-detail-row :object='object'></object-detail-row>
    </div>
    <div class="md-layout-item md-size-100">
      <md-button class='md-raised btn-no-margin md-primary' style='width: 100%' @click.native='currentIndex+=paginationIncrement' :disabled='$store.state.objects.length === 0 || currentIndex >= $store.state.objects.length'>
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
    }
  },
  watch: {
    selectedColorByKey( newVal ) {
      renderer.resetColors( )
      if ( newVal !== null )
        renderer.colorByProperty( { propertyName: newVal } )
    }
  },
  computed: {
    objects( ) {
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
