<template>
  <div>
    <!-- header & search, options, etc. -->
    <md-card class='spk-search-card md-elevation-8'>
      <div class="md-layout md-alignment-center-left">
        <!-- <div class="md-layout-item md-size-5 spk-padding"></div> -->
        <div class="md-layout-item md-size-30 spk-padding">
          <md-field md-clearable>
            <md-icon>search</md-icon>
            <md-input v-model="searchfilter"></md-input>
          </md-field>
        </div>
        <div class="md-layout-item md-size-70 spk-padding">
          <div class="md-layout md-alignment-center-right">
            <div class="md-layout-item">
              <md-switch v-model='showArchived' class='md-primary'><span class="md-caption"></span>Show Archived ({{archivedCount}})</span>
              </md-switch>
            </div>
            <div class="md-layout-item">
              <md-switch v-model='showShared' class='md-primary'>Show Shared</md-switch>
            </div>
            <div class="md-layout-item">
              <div class="md-caption">Showing {{startIndex}} - {{startIndex + itemsPerPage}} out of <strong> {{filteredStreams.length}} </strong> streams.</div>
            </div>
            <div class="md-layout-item md-size-20">
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
    <!-- main body -->
    <div class="md-layout md-alignment-center-center spk-push-down">
      <div class="md-layout-item md-size-80">
        <div v-if='streamsCount == 0'>
          <br>&nbsp
          <br>
          <div class="md-display-1">No streams here.</div>
          <div class="md-subheading">You haven't created any streams, none match your search or they're all archived.</div>
        </div>
      </div>
      <div class="md-layout-item md-size-80">
        <div class="md-layout md-size-80 spk-cell md-alignment-center-left md-gutter" v-if='streamsCount != 0'>
          <div class="md-layout-item md-size-10 md-caption"><strong>streamId</strong></div>
          <div class="md-layout-item md-size-20 md-caption spk-select-pointer-hover" @click='setSort("name")'>
            <strong>name</strong>
            <md-icon v-if='sortBy === "name"'>{{sortAscending ? "arrow_upward" : "arrow_downward"}}</md-icon>
          </div>
          <div class="md-layout-item md-size-15 md-text-center md-caption">
            <strong>permissions</strong>
          </div>
          <div class="md-layout-item md-size-15 md-text-center md-caption spk-select-pointer-hover" @click='setSort("updatedAt")'>
            <strong>last modified</strong>
            <md-icon v-if='sortBy === "updatedAt"'>{{sortAscending ? "arrow_upward" : "arrow_downward"}}</md-icon>
          </div>
          <div class="md-layout-item md-size-15 md-text-center md-caption spk-select-pointer-hover" @click='setSort("createdAt")'>
            <strong>created at</strong>
            <md-icon v-if='sortBy === "createdAt"'>{{sortAscending ? "arrow_upward" : "arrow_downward"}}</md-icon>
          </div>
          <div class="md-layout-item md-text-right md-caption"><strong>extras</strong></div>
        </div>
        <div class="md-layout md-alignment-center-left md-gutter spk-cell" :class='{ "spk-disabled": item.deleted }' v-for='item in paginatedStreams'>
          <div class="md-layout-item md-size-10 md-caption">
            {{ item.streamId }}
          </div>
          <div class="md-layout-item md-size-20">
            <editable :value='item.name' :stream-id='item.streamId'></editable>
          </div>
          <div class="md-text-center md-layout-item md-size-15">
            <div v-if='item.isOwner'>
              <md-switch v-model="item.private" class="md-primary" @change='setStreamPrivate(item)'></md-switch>
              <md-button :disabled='!item.private' class='md-dense md-icon-button md-raised' style='margin-top: 10px;' @click='showPermissions=true; selectedStreamId = item.streamId'>
                <md-icon>group_add</md-icon>
                <md-tooltip md-direction="bottom">Manage permissions</md-tooltip>
              </md-button>
            </div>
            <div v-else>
              <div class="md-caption">You are not the owner of this stream.</div>
            </div>
          </div>
          <div class="md-text-center md-layout-item md-size-15">
            <timeago :since='item.updatedAt' :auto-update="60"></timeago>
            <br>
            <span class="md-caption">{{ item.updatedAt | formatDate }}</span>
          </div>
          <div class="md-text-center md-layout-item md-size-15">
            {{ item.createdAt | formatDate }}
          </div>
          <div class="md-layout-item md-text-right">
            <md-button class='md-dense md-icon-button' style='margin-top: 10px;'>
              <md-icon>3d_rotation</md-icon>
              <md-tooltip md-direction="bottom">View 3d</md-tooltip>
            </md-button>
            <md-button class='md-dense md-icon-button' style='margin-top: 10px;'>
              <md-icon>filter_list</md-icon>
              <md-tooltip md-direction="bottom">Query</md-tooltip>
            </md-button>
            <md-button :class='{ "md-dense md-icon-button" : true, "md-accent" : !item.deleted, "md-primary" : item.deleted }' style='margin-top: 10px;' @click='setStreamArchived(item)'>
              <md-icon>{{item.deleted ? "unarchive" : "archive"}}</md-icon>
              <md-tooltip md-direction="bottom">{{item.deleted ? "Unarchive stream" : "Archive stream"}}</md-tooltip>
            </md-button>
          </div>
        </div>
      </div>
    </div>
    <!-- permissions dialog -->
    <md-dialog :md-active.sync="showPermissions">
      <md-dialog-title>Stream ownership and rights {{selectedStreamId}}</md-dialog-title>
      <permissions :stream-id='selectedStreamId'></permissions>
    </md-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

import Editable from './Editable.vue'
import Permissions from './Permissions.vue'

export default {
  components: {
    Editable,
    Permissions
  },
  computed: {
    archivedCount( ) { return this.$store.state.streams.filter( stream => stream.deleted ).length },
    streamsCount( ) { return this.filteredStreams.length },
    filteredStreams( ) {
      if ( this.searchfilter == null || this.searchfilter == '' )
        return this.$store.state.streams.filter( stream => this.showArchived ? true : !stream.deleted )
      else {
        this.startIndex = 0
        return this.$store.state.streams.filter( stream => stream.name.toLowerCase( ).includes( this.searchfilter.toLowerCase( ) ) || stream.streamId.toLowerCase( ).includes( this.searchfilter.toLowerCase( ) ) )
      }
    },
    paginatedStreams( ) {
      return this.filteredStreams
        .sort( ( a, b ) => {
          if( a[this.sortBy] < b[this.sortBy] )  return this.sortAscending ? -1 : 1
          if ( a[this.sortBy] > b[this.sortBy] ) return this.sortAscending ? 1 : -1
          return 0
        } )
        .slice( this.startIndex, this.startIndex + this.itemsPerPage )
    },
    pageCount( ) {
      return parseInt( this.streamsCount / this.itemsPerPage ) + 1
    },
    currentPage( ) {
      if ( this.startIndex == 0 ) return 1
      return this.startIndex / this.itemsPerPage + 1
    },
    ...mapGetters( [ 'streamById' ] )
  },
  data( ) {
    return {
      searchfilter: null,
      showArchived: false,
      showShared: true,
      startIndex: 0,
      itemsPerPage: 15,
      showPermissions: false,
      selectedStreamId: null,
      sortBy: 'createdAt',
      sortAscending: false,
    }
  },
  methods: {
    setStreamPrivate( item ) {
      this.$store.dispatch( "setStreamPrivate", { streamId: item.streamId, private: item.private } )
    },
    setStreamArchived( item ) {
      this.$store.dispatch( "setStreamArchived", { streamId: item.streamId, deleted: !item.deleted } )
    },
    setSort( prop, ascending ) {
      this.startIndex = 0
      if( this.sortBy === prop ) this.sortAscending = !this.sortAscending
        else this.sortAscending = true
      this.sortBy = prop
    }
  },
  mounted( ) {
    this.$store.dispatch( 'getStreams' )
  }
}

</script>
<style lang="scss">
.spk-cell {
  min-height: 80px;
  border-bottom: 1px solid #EEEEEE;
}

.spk-disabled {
  background-color: #E6E6E6;
  color: #7F7F7F !important;
  opacity: 0.8;
}

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
