<template>
  <md-card class='md-elevation-0'>
    <h1 class='md-display-1'>
      <router-link to='/projects'>Projects</router-link> /
      <span title='Click to edit.' class='project-name' :contenteditable="canEdit" @blur='updateName' v-html='getName()'></span>
    </h1>
    <p>
      projectId: <span style="user-select:all"><md-chip class='md-accent'><strong>{{project._id}}</strong></md-chip></span>
    </p>
    <md-divider></md-divider>
    <md-chips v-model="project.tags" @input='updateTags' md-placeholder="add tags" class='stream-chips' md-disabled='!canEdit'></md-chips>
  </md-card>
</template>
<script>
import debounce from 'lodash.debounce'

export default {
  name: 'HelloWorld',
  props: {
    project: Object
  },
  computed: {
    canEdit( ) {
      return this.project.owner === this.$store.state.user._id || this.project.canWrite.indexOf( this.$store.state.user._id ) > -1
    },
  },
  data( ) { return {} },
  methods: {
    getName( ) {
      return this.project.name
    },
    updateName( e ) {
      let newName = e.target.innerText.replace( /(\r\n|\n|\r)/gm, " " )
      if ( newName === this.project.name ) return
      this.project.name = newName
      this.$store.dispatch( 'updateProject', { _id: this.project._id, name: this.project.name } )
    },
    updateTags: debounce( function( e ) {
      this.$store.dispatch( 'updateProject', { _id: this.project._id, tags: this.project.tags } )
    }, 1000 ),
  }
}

</script>
<style scoped lang='scss'>
.project-name {
  transition: all 0.2s ease;
}

.project-name:hover {
  color: #448aff;
}

</style>
