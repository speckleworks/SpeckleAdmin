<template>
  <div>
    <div class=''>
      <div class="md-layout md-alignment-center-left user" v-for='user in allUsersPop' v-if='user'>
        <div class="md-layout-item md-size-10">
          <md-avatar class="md-avatar-icon md-small">{{user.name.substring(0,1).toUpperCase()}}</md-avatar>
        </div>
        <div class="md-layout-item md-size-40">
          {{user.name}} {{user.surname}}&nbsp<span v-if='user.company' class='md-caption'>({{user.company}})</span>
        </div>
        <div class="md-layout-item text-right" xxxv-if='!user.surname.includes(`(that is you!)`)'>
          <md-button :class='{ "md-dense md-raised": true, "md-primary" : hasWritePermission(user._id)}' @click.native='changePermission(user._id)' :disabled='user.surname.includes(`(that is you!)`)'>{{hasWritePermission(user._id) ? "write" : "read"}}</md-button>
          <md-button class='md-dense-xxx md-icon-button md-accent' @click.native='removeUser(user._id)' :disabled='user.surname.includes(`(that is you!)`)'>
            <md-icon>delete</md-icon>
          </md-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import union from 'lodash.union'
import uniq from 'lodash.uniq'

export default {
  name: 'PermissionTable',
  props: {
    resource: Object
  },
  computed: {
    canRead( ) { return this.resource.canRead },
    canWrite( ) { return this.resource.canWrite },
    allUsers( ) {
      return union( this.canRead, this.canWrite )
    },
    allUsersPop( ) {
      if ( this.allUsers.length === 0 ) return [ ]
      return this.allUsers.map( userId => this.$store.state.users.find( user => user._id === userId ) )
    }
  },
  data( ) {
    return {}
  },
  methods: {
    hasWritePermission( _id ) {
      return this.canWrite.indexOf( _id ) > -1
    },
    changePermission( _id ) {
      let index = this.canWrite.indexOf( _id )
      let localCanWrite = [ ],
        localCanRead = [ ]
      if ( index > -1 ) {
        localCanWrite = this.canWrite.filter( uId => uId !== _id )
        localCanRead = uniq( [ ...this.canRead, _id ] )
        this.$emit( 'update-table', { canRead: localCanRead, canWrite: localCanWrite } )
      } else {
        localCanWrite = uniq( [ ...this.canWrite, _id ] )
        this.$emit( 'update-table', { canRead: this.canRead, canWrite: localCanWrite } )
      }
    },
    removeUser( _id ) {
      let localCanWrite = this.canWrite.filter( uId => uId !== _id )
      let localCanRead = this.canRead.filter( uId => uId !== _id )
      this.$emit( 'update-table', { canRead: localCanRead, canWrite: localCanWrite } )
    }
  },
  mounted( ) {}
}

</script>
<style scoped lang='scss'>
.user {
  padding: 2px 10px;
}

</style>
