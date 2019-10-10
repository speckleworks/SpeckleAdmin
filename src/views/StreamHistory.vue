<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-card class='elevation-0'>
        <v-toolbar class='elevation-0 transparent' v-if='stream.parent'>
          <v-icon small left>home</v-icon>&nbsp;
          <!-- <v-icon small left>settings_backup_restore</v-icon>&nbsp; -->
          <span class="title font-weight-light">
            Parent stream: <router-link :to='"/streams/" + stream.parent'>{{stream.parent}}</router-link>
          </span>
        </v-toolbar>
        <v-toolbar class='elevation-0 transparent'>
          <v-icon small left>history</v-icon>&nbsp;
          <span class='title font-weight-light' v-if='stream.children.length>0'>
            Showing first {{currentMax > sizeBound.length ? sizeBound.length : currentMax}} out of {{timeFiltered.length}} streams in the specified time range.
          </span>
          <span class='title font-weight-light' v-else>
            This stream has no history.
          </span>
        </v-toolbar>
        <v-layout row wrap>
<!--           <v-flex xs12 class='pa-5'>
            <vue-slider ref="timeSlider" lazy @callback='sliderChanged' :data='dates' v-model='sliderValue' piecewise process-dragable :piecewise-label='dates.length < 5 ? true : false' xxxwidth='100%' xxxstyle='margin-left:10%;' :tooltipStyle="{ 'font-size':'11px' }" v-if='streamChildren.length>0'></vue-slider>
          </v-flex> -->
          <v-flex xs12 pa-3>
            <v-timeline clipped dense>
              <v-timeline-item v-for="stream in sizeBound" :key="stream.streamId" small :color="hexFromString(stream.streamId)">
                <template v-slot:opposite>
                </template>
                <div class="py-3">
                  <v-btn icon @click.native='$router.push(`/view/${stream.streamId}`)'>
                    <v-icon>360</v-icon>
                  </v-btn>
                  <span :class="`headline font-weight-bold ${hexFromString(stream.streamId)}--text`">
                    {{getDate(stream.createdAt)}} {{getTime(stream.createdAt)}}
                  </span>
                  <timeago :datetime='stream.createdAt'></timeago>
                  <p :class="`xxxheadline font-weight-light mb-3 ${hexFromString(stream.streamId)}--text`">
                    <v-icon small>{{stream.private ? "lock" : "lock_open"}}</v-icon> &nbsp;
                    <v-icon small>fingerprint</v-icon> {{stream.streamId}}
                    <span class='text-capitalize font-weight-bold'>{{stream.name}}</span>
                  </p>
                  <div>
                    <v-combobox @input='updateTags({tags: stream.tags, streamId: stream.streamId})' v-model="stream.tags" :items='allTags' hint='tags' solo persistent-hint small-chips deletable-chips multiple tags>
                      <template v-slot:no-data>
                        <p>Add a new tag!</p>
                      </template>
                    </v-combobox>
                    {{stream.commitMessage ? stream.commitMessage : "No commit message."}}
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import Axios from 'axios'
import debounce from 'lodash.debounce'
import union from 'lodash.union'

import VueSlider from 'vue-slider-component'
export default {
  name: 'StreamHistory',
  components: {
    VueSlider
  },
  watch: {
    'stream.children'( ) {
      this.fetchData( )
    }
  },
  computed: {
    allTags( ) {
      return this.$store.getters.allTags
    },
    sizeBound( ) {
      return this.timeFiltered.slice( 0, this.currentMax ).reverse( )
    },
    timeFiltered( ) {
      return this.streamChildren.slice( this.lowerIndex, this.upperIndex + 1 )
    },
    stream( ) {
      return this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
    },
    canEdit( ) {
      return this.isOwner ? true : this.stream.canWrite.indexOf( this.$store.state.user._id ) !== -1
    },
    isOwner( ) {
      return this.stream.owner === this.$store.state.user._id
    }
  },
  data( ) {
    return {
      streamChildren: [ ],
      dates: [ ],
      sliderValue: [ ],
      lowerIndex: 0,
      upperIndex: 0,
      currentMax: 20
    }
  },
  methods: {
    getDate( dateeee ) {
      let date = new Date( dateeee )
      return date.toLocaleString( 'en', { year: 'numeric', month: 'long', day: 'numeric' } )
    },
    getTime( dateeee ) {
      let date = new Date( dateeee )
      return date.toLocaleString( 'en', { timeStyle: "short" } )
    },
    updateTags: debounce( function ( e ) {
      // console.log( e )
      this.$store.dispatch( 'updateStream', { streamId: e.streamId, tags: e.tags } )
    }, 500 ),

    sliderChanged( args ) {
      console.log( args )
      let ind = this.$refs.timeSlider.getIndex( )
      this.lowerIndex = ind[ 0 ]
      this.upperIndex = ind[ 1 ]
    },
    fetchData( ) {
      if ( !this.stream.children ) return
      if ( this.stream.children.length === 0 ) return

      this.stream.children.map( streamId => Axios.get( `streams/${streamId}?fields=streamId,updatedAt,createdAt,owner,tags,name,commitMessage,description` ) )
        .reduce( ( promiseChain, currentTask ) => {
          return promiseChain.then( chainResults => currentTask.then( currentResult => [ ...chainResults, currentResult.data.resource ] ) )
        }, Promise.resolve( [ ] ) ).then( arr => {
          this.streamChildren = arr
          // this.streamChildren.push( this.stream )
          this.dates = this.streamChildren
            .map( c => c.updatedAt )
            .sort( ( a, b ) => new Date( b.updatedAt ) - new Date( a.updatedAt ) )
            .map( d => ( new Date( d ) ).toLocaleString( 'en' ) )
          this.sliderValue = [ this.dates[ 0 ], this.dates[ this.dates.length - 1 ] ]
          this.lowerIndex = 0
          this.upperIndex = this.dates.length - 1
        } )
    }
  },
  mounted( ) {
    console.log( 'hello data' )
    let stream = this.$store.state.streams.find( s => s.streamId === this.$route.params.streamId )
    this.fetchData( this.$route.params.streamId )
  }
}

</script>
<style lang='scss'>
.vue-slider-piecewise {
  z-index: 100 !important;
  pointer-events: none;
}

.vue-slider-piecewise-item {
  z-index: 100 !important;
}

</style>
