<template>
  <div>
    <!-- header & search, options, etc. -->
    <md-card class='spk-search-card md-elevation-8'>
      <div class="md-layout md-alignment-center-center">
        <div class="md-layout-item md-size-80 md-medium-size-100">
          <div class="md-layout md-alignment-center-left">
            <div class="md-layout-item md-size-50 spk-padding md-medium-size-80">
              <md-field md-clearable>
                <md-icon>search</md-icon>
                <md-input v-model="searchfilter"></md-input>
              </md-field>
            </div>
            <div class="md-layout-item md-size-50 spk-padding md-medium-hide">
              <div class="md-layout md-alignment-center-right">
                <div class="md-layout-item md-size-20 md-text-center">
                  <div class="md-caption">Showing {{startIndex}} - {{startIndex + itemsPerPage}} out of <strong> {{filteredStreams.length}} </strong> streams.</div>
                </div>
                <div class="md-layout-item md-size-80 md-text-right">
                  <md-checkbox v-model='showArchived' class='md-primary'>
                    <small>Show Archived ({{archivedCount}})</small>
                  </md-checkbox>
                  <md-checkbox v-model='showShared' class='md-primary'><small>Show Shared ({{sharedCount}})</small></md-checkbox>
                  <md-button class='md-icon-button md-dense' style='margin-top:10px;' @click='$store.dispatch("getStreams")'>
                    <md-icon>refresh</md-icon>
                  </md-button>
                </div>
              </div>
              <div>
              </div>
            </div>
            <div class="md-layout-item md-size-20 spk-padding md-medium-show md-text-right">
              <md-menu>
                <md-button md-menu-trigger class='md-icon-button'>
                  <md-icon>more_vert</md-icon>
                </md-button>
                <md-menu-content>
                  <md-menu-item>
                    <div class="md-caption">Showing {{startIndex}} - {{startIndex + itemsPerPage}} out of <strong> {{filteredStreams.length}} </strong> streams.</div>
                  </md-menu-item>
                  <md-menu-item>
                    <md-checkbox v-model='showShared' class='md-primary'><small>Show Shared ({{sharedCount}})</small></md-checkbox>
                  </md-menu-item>
                  <md-menu-item>
                    <md-checkbox v-model='showArchived' class='md-primary'>
                      <small>Show Archived ({{archivedCount}})</small>
                    </md-checkbox>
                  </md-menu-item>
                  <md-menu-item>
                    <md-button class='md-dense md-primary' xxxstyle='margin-top:10px;' @click='$store.dispatch("getStreams")'>
                    refresh streams
                  </md-button>
                  </md-menu-item>
                </md-menu-content>
              </md-menu>
            </div>
          </div>
        </div>
      </div>
    </md-card>
    <!-- main body -->
    <div class="md-layout md-alignment-center-center xxxspk-push-down">
      <!-- empty state -->
      <div class="md-layout-item md-size-80 md-small-size-90" style="padding-top:100px" v-if='streamsCount == 0'>
        <div>
          <br>&nbsp
          <br>
          <div class="md-display-1">No streams here.</div>
          <div class="md-subheading">You haven't created any streams, none match your search or they're all archived.</div>
        </div>
      </div>
      <!-- table -->
      <div class="md-layout-item md-size-80 md-medium-size-95" style="padding-top:100px">
        <!-- table header -->
        <div class="md-layout md-size-80 spk-cell md-alignment-center-left md-gutter " v-if='streamsCount != 0'>
          <!-- <div class="md-layout-item md-size-5 md-caption">
            <strong>select</strong>
          </div> -->
          <div class="md-layout-item md-size-10 md-caption md-small-hide"><strong>streamId</strong></div>
          <div class="md-layout-item md-size-20 md-small-size-40 md-caption spk-select-pointer-hover" @click='setSort("name")'>
            <strong>name</strong>
            <md-icon class='spk-small-icon' v-if='sortBy === "name"'>{{sortAscending ? "arrow_upward" : "arrow_downward"}}</md-icon>
          </div>
          <div class="md-layout-item md-size-15 md-xsmall-size-15 md-text-center md-caption spk-select-pointer-hover" @click='setSort("private")'>
            <strong>permissions</strong>
            <md-icon class='spk-small-icon' v-if='sortBy === "private"'>{{sortAscending ? "arrow_upward" : "arrow_downward"}}</md-icon>
          </div>
          <div class="md-layout-item md-size-15 md-text-center md-caption spk-select-pointer-hover md-xsmall-hide" @click='setSort("updatedAt")'>
            <strong>last modified</strong>
            <md-icon class='spk-small-icon' v-if='sortBy === "updatedAt"'>{{sortAscending ? "arrow_upward" : "arrow_downward"}}</md-icon>
          </div>
          <div class="md-layout-item md-size-15 md-medium-size-30 md-text-center md-caption spk-select-pointer-hover" @click='setSort("createdAt")'>
            <strong>created at</strong>
            <md-icon class='spk-small-icon' v-if='sortBy === "createdAt"'>{{sortAscending ? "arrow_upward" : "arrow_downward"}}</md-icon>
          </div>
          <div class="md-layout-item md-text-center md-caption md-medium-hide"><strong>extras</strong></div>
          <div class="md-layout-item md-size-10 md-text-right md-caption md-medium-hide md-small-hide" @click='setSort("deleted");showArchived=true'>
            <strong>archived</strong>
            <md-icon class='spk-small-icon' v-if='sortBy === "deleted"'>{{sortAscending ? "arrow_upward" : "arrow_downward"}}</md-icon>
          </div>
        </div>
        <!-- table proper -->
        <div class="md-layout md-alignment-center-left md-gutter spk-cell" :class='{ "spk-disabled": item.deleted, "spk-shared-background" : !item.isOwner}' v-for='item in paginatedStreams'>
          <div class="md-layout-item md-size-10 md-caption md-small-hide">
            {{ item.streamId }}
          </div>
          <div class="md-layout-item md-size-20 md-small-size-40">
            <editable :value='item.name' :stream-id='item.streamId' @setValue='setStreamName' :disabled='!(item.canWrite.indexOf($store.state.user._id) >= 0 ) && !item.isOwner'></editable>
          </div>
          <div class="md-text-center md-layout-item md-size-15">
            <div v-if='item.isOwner'>
              <md-button :disabled='item.deleted' class='md-dense-xxx md-icon-button md-raisedxxx' :class='{"md-primary":!item.private}' style='margin-top: 10px;' @click='showPermissions=true; selectedStreamId = item.streamId'>
                <md-icon>{{item.private ? (item.userPermissions.length == 0 ? "lock_outline": "lock_open" ) : "public" }}</md-icon>
                <!-- <md-tooltip md-direction="bottom">Manage permissions<strong></strong>.</md-tooltip> -->
              </md-button>
            </div>
            <div v-else>
              <md-button class='md-icon-button' @click='showSharedInfo=true; selectedStreamId=item.streamId'>
                <md-icon>{{item.canWrite.indexOf($store.state.user._id) >= 0 ? "mode_edit" : "remove_red_eye" }}</md-icon>
                <!--                 <md-tooltip md-direction='bottom'>
                  You {{item.canWrite.indexOf($store.state.user._id) >= 0 ? "have write access." : "can only view." }} Owned by {{item.owner.email}}.
                </md-tooltip> -->
              </md-button>
            </div>
          </div>
          <div class="md-text-center md-layout-item md-size-15 md-xsmall-hide">
            <span>
              <timeago :since='item.updatedAt' :auto-update="60"></timeago>
              <!-- <md-tooltip md-direction='bottom'>{{ item.updatedAt | formatDate }}</md-tooltip> -->
            </span>
          </div>
          <div class="md-text-center md-layout-item">
            {{ item.createdAt | formatDate }}
          </div>
          <div class="md-layout-item md-text-center md-medium-hide">
            <md-button class='md-dense md-icon-button' style='margin-top: 10px; pointer-events:all;' @click='goToViewer(item.streamId)'>
              <md-icon>3d_rotation</md-icon>
              <!-- <md-tooltip md-direction="bottom">View 3D data</md-tooltip> -->
            </md-button>
            <md-button class='md-dense md-icon-button md-small-hide' style='margin-top: 10px;pointer-events:all;' @click='showHistory=true'>
              <md-icon>history</md-icon>
              <!-- <md-tooltip md-direction="bottom">stream history</md-tooltip> -->
            </md-button>
            <md-button class='md-dense md-icon-button md-xsmall-hide' style='margin-top: 10px;' @click='showQuery=true'>
              <md-icon>filter_list</md-icon>
              <!-- <md-tooltip md-direction="bottom">Query</md-tooltip> -->
            </md-button>
          </div>
          <div class="md-layout-item md-size-10 md-text-right md-medium-hide">
            <md-button :class='{ "md-dense md-icon-button" : true, "md-accent" : !item.deleted, "md-primary" : item.deleted }' style='margin-top: 10px; pointer-events:all;' @click='setStreamArchived(item)' :disabled='!(item.canWrite.indexOf($store.state.user._id) >= 0 )&&!item.isOwner'>
              <md-icon>{{item.deleted ? "unarchive" : "archive"}}</md-icon>
              <md-tooltip md-direction="bottom">{{item.deleted ? "Unarchive stream" : "Archive stream"}}</md-tooltip>
            </md-button>
          </div>
          <div class="md-layout-item md-size-10 spk-padding md-medium-show md-text-right" style='pointer-events:all'>
            <md-menu>
              <md-button md-menu-trigger class='md-icon-button'>
                <md-icon>more_vert</md-icon>
              </md-button>
              <md-menu-content>
                <md-menu-item>
                  <md-button class='md-dense' @click='goToViewer(item.streamId)'>
                    View 3d
                  </md-button>
                </md-menu-item>
                <md-menu-item>
                  <md-button class='md-dense' @click='showHistory=true'>
                    History
                  </md-button>
                </md-menu-item>
                <md-menu-item>
                  <md-button class='md-dense' @click='showQuery=true'>
                    Query
                  </md-button>
                </md-menu-item>
                <md-divider></md-divider>
                <md-menu-item>
                  <md-button :class='{ "md-dense" : true, "md-accent" : !item.deleted, "md-primary" : item.deleted }' @click='setStreamArchived(item)' :disabled='!(item.canWrite.indexOf($store.state.user._id) >= 0 )&&!item.isOwner'>
                    {{item.deleted ? "Unarchive" : "Archive"}}
                  </md-button>
                </md-menu-item>
              </md-menu-content>
            </md-menu>
          </div>
        </div>
      </div>
      <!-- pagination again -->
      <div class="md-layout-item md-size-30 md-small-size-100" style="margin-top:40px">
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
      <div class="md-layout-item md-size-100 md-small-size-100 md-text-center" style="margin-top:20px;margin-bottom: 40px;">
        <div class="md-caption">Showing {{startIndex}} - {{startIndex + itemsPerPage}} out of <strong> {{filteredStreams.length}} </strong> streams.</div>
      </div>
    </div>
    <!-- permissions dialog -->
    <permissions :stream-id='selectedStreamId' :user-list='selectedStream.userPermissions' @close='showPermissions=false' v-if='showPermissions'></permissions>
    <!-- query dialog -->
    <query @close='showQuery=false' v-if='showQuery'></query>
    <!-- history dialog -->
    <history @close='showHistory=false' v-if='showHistory'></history>
    <!-- shared info dialog -->
    <md-dialog :md-active.sync='showSharedInfo' v-if='showSharedInfo' :md-fullscreen='false'>
      <div>
        <md-app-toolbar class="md-primary md-dense" style='height: 30px'>
          <div class="md-toolbar-section-start">
            <div class="md-toolbar-row">
              <md-button class='md-dense md-icon-button' @click='showSharedInfo=false'>
                <md-icon>close</md-icon>
              </md-button>
              <p>Shared Stream Info</p>
            </div>
          </div>
        </md-app-toolbar>
        <div class="md-layout md-alignment-center-center spk-padding spk-useradd-dialog" style="padding: 30px;">
          <div class="md-layout-item md-size-100">
            <div class="md-display-1">Owner: {{selectedStream.owner.name}} {{selectedStream.owner.surname}}</div>
            <div class="md-caption">{{selectedStream.owner.email}}</div>
            <br>
            <md-divider></md-divider>
            <br>
            <div class="md-subheading">You can <span class='spk-color-blue'>{{selectedStream.canWrite.indexOf($store.state.user._id) >= 0 ? "read & write" : "only view" }} <md-icon>{{selectedStream.canWrite.indexOf($store.state.user._id) >= 0 ? "mode_edit" : "remove_red_eye" }}</md-icon></span></div>
          </div>
        </div>
      </div>
    </md-dialog>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

import Editable from './Editable.vue'
import Permissions from './Permissions.vue'
import Query from './Query.vue'
import History from './History.vue'

export default {
  components: {
    Editable,
    Permissions,
    Query,
    History
  },
  computed: {
    selectedStream( ) { return this.selectedStreamId ? this.$store.state.streams.find( stream => stream.streamId === this.selectedStreamId ) : [ ] },
    archivedCount( ) { return this.$store.state.streams.filter( stream => stream.deleted ).length },
    sharedCount( ) { return this.$store.state.streams.filter( stream => !stream.isOwner ).length },
    streamsCount( ) { return this.filteredStreams.length },
    filteredStreams( ) {
      if ( this.searchfilter == null || this.searchfilter == '' )
        return this.$store.state.streams.filter( stream => ( this.showArchived ? true : !stream.deleted ) && ( this.showShared ? true : stream.isOwner ) )
      else {
        this.startIndex = 0
        return this.$store.state.streams.filter( stream => stream.name.toLowerCase( ).includes( this.searchfilter.toLowerCase( ) ) || stream.streamId.toLowerCase( ).includes( this.searchfilter.toLowerCase( ) ) )
      }
    },
    paginatedStreams( ) {
      return this.filteredStreams
        .sort( ( a, b ) => {
          if ( this.sortBy == 'private' ) {
            // TODO: Special case
          }
          if ( a[ this.sortBy ] < b[ this.sortBy ] ) return this.sortAscending ? -1 : 1
          if ( a[ this.sortBy ] > b[ this.sortBy ] ) return this.sortAscending ? 1 : -1
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
      itemsPerPage: 10,
      showPermissions: false,
      showQuery: false,
      showHistory: false,
      showSharedInfo: false,
      selectedStreamId: null,
      sortBy: 'createdAt',
      sortAscending: false,
    }
  },
  methods: {
    goToViewer( streamId ) {
      let url = this.$store.state.server.replace( 'api', 'view/?' + streamId )
      console.log( url )
      let win = window.open( url, '_blank' );
      win.focus( );
    },
    setStreamName( name, id ) {
      this.$store.dispatch( "patchStream", { streamId: id, data: { name: name } } )
    },
    setStreamArchived( item ) {
      this.$store.dispatch( "patchStream", { streamId: item.streamId, data: { deleted: !item.deleted } } )
    },
    setSort( prop, ascending ) {
      this.startIndex = 0
      if ( this.sortBy === prop ) this.sortAscending = !this.sortAscending
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
.spk-small-icon {
  font-size: 14px !important;
}

.spk-cell {
  min-height: 80px;
  border-bottom: 1px solid #EEEEEE;
}

.spk-disabled {
  // background-color: #E6E6E6;
  color: #7F7F7F !important;
  opacity: 0.8;
  background: repeating-linear-gradient( 45deg,
  #F5F5F5,
  #F5F5F5 10px,
  #FFFFFF 10px,
  #FFFFFF 20px);
  pointer-events: none;
}

.spk-shared-background {}

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
