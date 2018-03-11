<template>
  <div>
    <md-card class='spk-search-card md-elevation-8'>
      <div class="md-layout md-alignment-center-left">
        <div class="md-layout-item md-size-10 spk-padding"></div>
        <div class="md-layout-item md-size-40 spk-padding">
          <md-field>
            <md-icon>search</md-icon>
            <md-input v-model="searchfilter"></md-input>
          </md-field>
        </div>
        <div class="md-layout-item md-size-40 spk-padding">
          <div class="md-layout md-alignment-center-right">
            <div class="md-layout-item">
              <div class="md-caption">Showing {{startIndex}} - {{startIndex + itemsPerPage}} out of <strong> {{filteredStreams.length}} </strong> streams.</div>
            </div>
            <div class="md-layout-item md-size-60">
              <div class="md-layout md-alignment-center-center">
                <div class="md-layout-item md-text-center">
                  <md-button :disabled='startIndex==0' class='md-dense md-icon-button md-raised md-primary' @click='startIndex -= startIndex != 0 ? itemsPerPage : 0'>
                    <md-icon>chevron_left</md-icon>
                  </md-button>
                </div>
                <div class="md-layout-item md-text-center">
                  <div class='md-caption md-text-center'>{{currentPage}} / {{pageCount}}</div>
                </div>
                <div class="md-layout-item md-text-center">
                  <md-button :disabled='currentPage == pageCount' class='md-dense md-icon-button md-raised md-primary' @click='startIndex += currentPage == pageCount ? 0 : itemsPerPage '>
                    <md-icon>chevron_right</md-icon>
                  </md-button>
                </div>
              </div>
            </div>
          </div>
          <div>
          </div>
        </div>
      </div>
    </md-card>
    <div class="md-layout md-alignment-center-center spk-push-down">
      <div class="md-layout-item md-size-80">
        <div v-if='streamsCount == 0'>
          <br>&nbsp
          <br>
          <div class="md-display-1">No streams here.</div>
          <div class="md-subheading">You haven't created any streams or none match your search.</div>
        </div>
        <md-table v-model="paginatedStreams" v-else>
          <md-table-row slot="md-table-row" slot-scope="{ item }">
            <md-table-cell md-label="Stream Id">{{ item.streamId }}</md-table-cell>
            <md-table-cell md-label="Name">
              <!-- <div class='spk-stream-name'><strong>{{ item.name }}</strong></div> -->
              <editable v-model='item.name' :stream-id='item.streamId'></editable>
            </md-table-cell>
            <md-table-cell md-label="Ownership & Rights">
              <div v-if='item.isOwner'>
                <md-switch v-model="item.private" class="md-primary" @change='setStreamPrivate(item)'></md-switch>
                <md-button :disabled='!item.private' class='md-dense md-icon-button md-raised' style='margin-top: 10px;' @click='showPermissions=true'>
                  <md-icon>group_add</md-icon>
                  <md-tooltip md-direction="bottom">Manage permissions</md-tooltip>
                </md-button>
              </div>
              <div v-else>
                <div class="md-caption">You are not the owner of this stream.</div>
              </div>
            </md-table-cell>
            <md-table-cell md-label="Last updated">{{ item.updatedAt | formatDate }}</md-table-cell>
            <md-table-cell md-label="Created at">{{ item.createdAt | formatDate }}</md-table-cell>
            <md-table-cell md-label="Extras">
              <md-button class='md-dense md-icon-button' style='margin-top: 10px;'>
                <md-icon>3d_rotation</md-icon>
                <md-tooltip md-direction="bottom">View 3d</md-tooltip>
              </md-button>
              <md-button class='md-dense md-icon-button' style='margin-top: 10px;'>
                <md-icon>filter_list</md-icon>
                <md-tooltip md-direction="bottom">Query</md-tooltip>
              </md-button>
              <md-button class='md-dense md-icon-button md-accent' style='margin-top: 10px;'>
                <md-icon>delete</md-icon>
                <md-tooltip md-direction="bottom">Delete stream</md-tooltip>
              </md-button>
            </md-table-cell>
          </md-table-row>
        </md-table>
      </div>
    </div>
    <md-dialog :md-active.sync="showPermissions">
      <md-dialog-title>Stream ownership and rights</md-dialog-title>
      <md-content>
        <md-field>
          <md-icon>search</md-icon>
          <md-input></md-input>
        </md-field>
      </md-content>
    </md-dialog>
  </div>
</template>
<script>
import Editable from './Editable.vue'

export default {
  components: {
    Editable
  },
  computed: {
    streamsCount( ) { return this.filteredStreams.length },
    filteredStreams( ) {
      if ( this.searchfilter == null || this.searchfilter == '' )
        return this.$store.state.streams
      else {
        this.startIndex = 0
        return this.$store.state.streams.filter( stream => stream.name.toLowerCase( ).includes( this.searchfilter.toLowerCase( ) ) || stream.streamId.toLowerCase( ).includes( this.searchfilter.toLowerCase( ) ) )
      }
    },
    paginatedStreams( ) {
      return this.filteredStreams.slice( this.startIndex, this.startIndex + this.itemsPerPage )
    },
    pageCount( ) {
      return parseInt( this.streamsCount / this.itemsPerPage ) + 1
    },
    currentPage( ) {
      if ( this.startIndex == 0 ) return 1
      return this.startIndex / this.itemsPerPage + 1
    }
  },
  data( ) {
    return {
      searchfilter: null,
      startIndex: 0,
      itemsPerPage: 15,
      showPermissions: false
    }
  },
  methods: {
    setStreamPrivate( item ) {
      // console.log( stream.private )
      this.$store.dispatch( "setStreamPrivate", { streamId: item.streamId, private: item.private } )
    }
  },
  mounted( ) {
    this.$store.dispatch( 'getStreams' )
  }
}

</script>
<style lang="scss">


.spk-padding {
  box-sizing: border-box;
  padding-left: 10px;
  padding-right: 10px;
}

.spk-push-down {
  margin-top: 90px;
}

.spk-tools {
  box-sizing: border-box;
  padding-left: 10px;
  margin-left: 10px;
}

.spk-search-card {
  position: absolute;
  top: 30px;
  padding-top: 40px;
  width: 100%;
  left: 0;
  margin: 0 !important; // width: 100%;
  background-color: white;
  z-index: 5;
}

</style>
