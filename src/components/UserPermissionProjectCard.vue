<template>
  <v-card tile class='pa-3 elevation-0' v-if='user'>
    <v-layout row wrap align-center justify-space-between>
      <v-flex xs8>
        <span>{{user.name}} {{user.surname}}</span><br>
        <span class='caption'>{{user.company}}</span>
      </v-flex>
      <v-flex xs4>
        <!-- write streams -->
        <v-btn block depressed small :color='hasWritePermissionStreams?"primary":""' @click.native='changePermissionStreams()' :disabled='!canEdit'>
          {{ user.isOwner ? "write streams" : hasWritePermissionStreams ? "write streams" : "read streams"}}
        </v-btn>
        <!-- write project -->
        <v-btn block depressed small :color='hasWritePermissionProject?"primary":""' @click.native='changePermissionProject()' :disabled='!canEdit'>
          {{ user.isOwner ? "write project" : hasWritePermissionProject ? "write project" : "read project"}}
        </v-btn>
        <!-- remove user -->
        <v-btn block flat small @click.native='removeUser()' :disabled='!canEdit'>
          remove user
        </v-btn>
      </v-flex>
    </v-layout>
  </v-card>
</template>
<script>
export default {
  name: 'UserPermissionProjectCard',
  props: {
    project: Object,
    user: Object,
    globalDisabled: Boolean,
  },
  computed: {
    canEdit(){
      return this.user.surname.includes(`(that is you!)`) || this.globalDisabled || this.user.isOwner || this.$store.state.user.role === 'admin'
    },
    hasWritePermissionStreams(){
      return this.project.permissions.canWrite.indexOf( this.user._id ) > -1
    },
    hasWritePermissionProject(){
      return this.project.canWrite.indexOf( this.user._id ) > -1 
    }
  },
  data( ) { return {} },
  methods: {
    changePermissionStreams(){
      this.$emit('change-permission-streams', this.user._id )
    },
    changePermissionProject(){
      this.$emit('change-permission-project', this.user._id )
    },
    removeUser(){
      this.$emit('remove-user', this.user._id )
    }
  }
}

</script>
<style scoped lang='scss'>
</style>
