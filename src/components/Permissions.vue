<template>
  <div class="spk-permissions-dialgoue">
    <md-app-toolbar class="md-primary md-dense">
      <div class="md-toolbar-section-start">
        <div class="md-toolbar-row">
          <md-button class='md-dense md-icon-button' @click='$emit("close")'>
            <md-icon>close</md-icon>
          </md-button>
          
          <p style=''>Stream Permissions</p>
        </div>
      </div>
    </md-app-toolbar>
    <div class="md-layout md-alignment-center-center">
      <div class="md-layout-item md-size-80">
        <br>
        <div class="md-layout md-alignment-center-left md-gutter" xxxv-if='users.length==0'>
          <div class="md-layout-item">
            <h2 class='md-display-1'>
              <strong @click='showStreamId = !showStreamId' class='spk-select-pointer-hover'>
                {{showStreamId ? stream.streamId : stream.name}}
              </strong> is <span class='spk-color-blue spk-select-pointer-hover' @click='stream.private = !stream.private'>{{stream.private ? "private" : "public"}}</span> <md-switch v-model='stream.private' class='md-primary'></md-switch> 
              <span v-if='users.length > 0 && stream.private'>and shared with {{users.length}} users.</span>
              <span v-if='users.length == 0 && stream.private'>and not currently shared.</span> 
              <span v-if='!stream.private'> so anyone with the link can see it.</span>
              <span v-if='!stream.private'>Anonymous comments are <span class='spk-color-blue spk-select-pointer-hover' @click='stream.anonymousComments = !stream.anonymousComments'>{{stream.anonymousComments ? "allowed" : "not allowed" }}.</span></span>
            </h2>
            <!-- <h3 class='md-headline'>
            </h3> -->
            <!-- <md-switch v-model='stream.anonymousComments' class='md-primary'></md-switch> -->
            <!-- <p>You can add users below & spread that data!</p> -->
          </div>
        </div>
        <div class="md-layout md-alignment-center-left md-gutter" v-if='users.length!=0 && stream.private'>
          <div class="md-layout-item md-size-100">
            <h2 class='md-title'>Users with access:</h2>
          </div>
        </div>
        <br>
        <div class="md-layout md-alignment-center-left md-gutter" v-if='users.length!=0 && stream.private'>
          <div class="md-layout-item md-size-30 md-caption">
            <strong>name</strong>
          </div>
          <div class="md-layout-item md-size-20 md-caption">
            <strong>email</strong>
          </div>
          <div class="md-layout-item md-size-10 md-caption">
            <strong>company</strong>
          </div>
          <div class="md-layout-item md-size-30 md-text-center md-caption">
            <strong>permissions</strong>
          </div>
          <div class="md-layout-item md-text-right" @click='removeUser(index)'>
          </div>
        </div>
        <div class="md-layout spk-cell-users md-alignment-center-left md-gutter" v-for='(user, index) in users' :key='user.email' v-if='users.length!=0 && stream.private'>
          <div class="md-layout-item md-size-30">
            {{ user.name }} {{ user.surname }}
          </div>
          <div class="md-layout-item md-size-20 md-caption">
            {{ user.email }}
          </div>
          <div class="md-layout-item md-size-10 md-caption">
            {{ user.company ? user.company : 'n/a' }}
          </div>
          <div class="md-layout-item md-size-30 md-text-center">
            <md-button @click='user.canWrite = !user.canWrite' style='width: 120px;' :class='{"md-raised":user.canWrite}'>
              {{user.canWrite ? "Read & Write" : "Read Only"}}
            </md-button>
          </div>
          <div class="md-layout-item md-text-right" @click='removeUser(index)'>
            <md-button class='md-icon-button md-accent md-dense'>
              <md-icon>close</md-icon>
              <md-tooltip md-direction='bottom' style='z-index: 1000'>Remove this user</md-tooltip>
            </md-button>
          </div>
        </div>
        <br>
        <md-dialog :md-active.sync="showSearch">
          <add-users @close='showSearch=false' @addUser='addUser'></add-users>
        </md-dialog>
        <div class="md-layout">
          <div class="md-layout-item md-size-100 xxxmd-text-right">
            <md-button class='md-primary md-raised' @click='showSearch=true' v-if='stream.private'>Add users</md-button>
            <md-button class='md-raised' @click='$emit("close")'>Close</md-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash.debounce'
import AddUsers from './AddUsers.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    AddUsers
  },
  props: [ 'streamId', 'userList' ],
  watch: {
    'stream.private' ( ) {
      this.$store.dispatch( "patchStream", { streamId: this.stream.streamId, data: { private: this.stream.private } } )
    },
    'stream.anonymousComments' () {
      this.$store.dispatch( "patchStream", { streamId: this.stream.streamId, data: { anonymousComments: this.stream.anonymousComments } } )
    },
    'permissions': debounce( function () {
      console.log( 'permissions changed dude')
      this.$store.dispatch( "patchStream", { streamId: this.stream.streamId, data: { ...this.permissions } } )
      this.$store.commit('setPermAgg', { streamId: this.stream.streamId, permAgg: this.users } )
    }, 1000 )
  },
  computed: {
    ...mapGetters( [ 'streamById' ] ),
    stream( ) {
      return this.streamById( this.streamId )
    },
    permissions( ) {
      let canRead = [ ]
      let canWrite = [ ]

      this.users.forEach( user => {
        if ( user.canWrite ) {
          canRead.push( user._id );
          canWrite.push( user._id );
        } else if ( user.canRead ) canRead.push( user._id )
      } )

      return { canRead: canRead, canWrite: canWrite }
    }
  },
  data( ) {
    return {
      users: JSON.parse( JSON.stringify( this.userList ) ), // this sucks like hard
      showSearch: false,
      showStreamId: false
    }
  },
  methods: {
    removeUser( index ) {
      this.users.splice( index, 1 )
    },
    changeWrite( user, index ) {
      if ( !user.changeWrite ) user.canRead = true
    },
    addUser( user ) {
      this.users.push( { ...user } )
    }
  },
  mounted( ) {}
}

</script>
<style lang="scss">
.spk-color-blue {
  color: #0080FF
}

.spk-cell-users {
  min-height: 40px;
  border-bottom: 1px solid #F3F3F3;
}

.spk-permissions-dialgoue {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3000;
  background-color: white;
}

</style>
