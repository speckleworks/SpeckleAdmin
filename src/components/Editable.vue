<template>
  <div class='md-layout md-alignment-center-center spk-select-pointer-hover'>
    <div class="md-layout-item md-size-95">
      <div v-if='!edit' class='md-subheading' @click='setEdit()'>
        <span class="spk-stream-name">{{ value }}</span>
      </div>
      <md-field v-if='edit' :class="{ 'md-invalid' : errors.has('name'),  'spk-stream-name' : true }">
        <md-input v-model="innerText" data-vv-name="name" v-validate name="name" data-vv-rules="required|min:3" @keyup.enter="submit" @keyup.escape="reset" @blur='focusLost' ref='inputfield'></md-input>
        <span v-show="errors.has('name')" class="md-error">{{errors.first('name')}}</span>
      </md-field>
    </div>
    <!-- <div class="md-layout-item md-size-5">
      <md-progress-spinner v-if='showSave' :md-stroke="1" :md-diameter="10" md-mode="indeterminate"></md-progress-spinner>
    </div> -->
  </div>
</template>
<script>
export default {
  props: [ 'value', 'streamId' ],
  computed: {},
  data( ) {
    return {
      edit: false,
      innerText: this.value.toString( ),
      intialValue: null,
      showSave: false,
      ignoreFocus: false
    }
  },
  methods: {
    setEdit( ) {
      this.edit = true
      this.innerText = this.value
      this.$nextTick( ( ) => {
        // console.log( this.$refs.inputfield )
        this.$refs.inputfield.$el.focus( )
      } )
    },
    reset( ) {
      this.innerText = this.intialValue
      document.activeElement.blur( )
    },
    submit( ) {
      this.$validator.validateAll( ).then( result => {
        if ( !result ) return console.log( 'has serrors' )
        this.edit = false

        if ( this.innerText === this.intialValue ) return console.log( 'nothing changed' )

        this.showSave = true
        this.ignoreFocus = true

        document.activeElement.blur( )

        this.$emit( 'setValue', this.innerText, this.streamId )
        // this.$store.dispatch( 'setStreamName', { streamId: this.streamId, name: this.innerText } )
        //   .then( res => {
        //     this.intialValue = this.innerText
        //     this.showSave = false
        //   } )
        //   .catch( err => {
        //     this.showSave = false
        //   } )
      } )
    },
    focusLost( ) {
      if ( this.ignoreFocus ) {
        this.ignoreFocus = false
        return
      }
      this.$validator.validateAll( ).then( result => {
        if ( result ) {
          this.edit = false
          return this.submit( )
        }
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
.spk-select-pointer-hover:hover {
  cursor: pointer;
}

.spk-stream-name {
  border-bottom: 1px dashed #FFFFFF;
  transition: all .2s ease;
}
.spk-stream-name:hover{
  border-bottom: 1px dashed #BFBFBF;
}

</style>
