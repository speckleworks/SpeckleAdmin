<template>
  <div class='md-layout md-alignment-center-center'>
    <div class="md-layout-item md-size-95">
      <md-field :class="{ 'md-invalid' : errors.has('name'),  'spk-stream-name' : true }">
        <md-input v-model="innerText" data-vv-name="name" v-validate name="name" data-vv-rules="required|min:3" @keyup.enter="submit" @keyup.escape="reset" @blur='focusLost'></md-input>
        <span v-show="errors.has('name')" class="md-error">{{errors.first('name')}}</span>
      </md-field>
    </div>
    <div class="md-layout-item md-size-5">
      <md-progress-spinner v-if='showSave' :md-stroke="1" :md-diameter="10" md-mode="indeterminate"></md-progress-spinner>
    </div>
  </div>
</template>
<script>
export default {
  props: [ 'value', 'streamId' ],
  data( ) {
    return {
      innerText: this.value,
      intialValue: null,
      showSave: false,
      ignoreFocus: false
    }
  },
  methods: {
    reset( ) {
      this.innerText = this.intialValue
      document.activeElement.blur( )
    },
    submit( ) {
      this.$validator.validateAll( ).then( result => {
        if ( !result ) return console.log( 'has serrors' )
        console.log( 'should submit', this.streamId )

        this.showSave = true
        this.ignoreFocus = true
        document.activeElement.blur( )

        this.$store.dispatch( 'setStreamName', { streamId: this.streamId, name: this.innerText } )
          .then( res => {
            this.intialValue = this.innerText
            this.showSave = false
          } )
          .catch( err => {
            this.showSave = false
          } )
      } )
    },
    focusLost( ) {
      if ( this.ignoreFocus ) {
        this.ignoreFocus = false
        return
      }

      this.$validator.validateAll( ).then( result => {
        if ( result )
          return this.submit( )
        return this.reset( )
      } )
    }
  },
  mounted( ) {
    this.intialValue = this.value
  }
}

</script>
<style lang="scss">
.spk-stream-name.md-field:after {
  display: none !important;
}

</style>
