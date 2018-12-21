<template>
  <span
    :title='hint'
    :contenteditable='!disabled'
    @blur='updateOnBlur'
    @keydown.enter='updateOnEnter'
    v-html='getContent()'>
  </span>
</template>
<script>
export default {
  name: 'EditableSpan',
  props: {
    text: { type: String, default: 'loading...' },
    disabled: { type: Boolean, default: false },
    hint: { type: String, default: 'click to edit' },
    dataKey: { type: String, default: '' }
  },
  computed: {},
  data( ) {
    return {
      innerText: null
    }
  },
  methods: {
    getContent( ) {
      return this.innerText ? this.innerText : this.text
    },
    updateOnBlur( e ) {
      let newContent = e.target.innerText.replace( /(\r\n|\n|\r)/gm, " " )
      if ( newContent === '' ) newContent = this.getContent( )
      if ( this.getContent( ) === newContent ) {
        // e.target.blur( )
        return
      }
      // e.target.blur( )
      this.innerText = newContent
      this.$emit( 'update', { text: newContent, dataKey: this.dataKey } )
    },
    updateOnEnter( e ) {
      let newContent = e.target.innerText.replace( /(\r\n|\n|\r)/gm, " " )
      if ( newContent === '' ) newContent = this.getContent( )
      if ( this.getContent( ) === newContent ) {
        e.target.blur( )
        return
      }
      e.target.blur( )
      this.innerText = newContent
      // this.$emit( 'update', { text: newContent, dataKey: this.dataKey } )
    }
  }
}

</script>
<style scoped lang='scss'>
$SpeckleBlue: #448aff;
span {
  border-bottom: 2px solid transparent;
  transition: all .3s ease;
}
span:hover {
  cursor: text;
  color: $SpeckleBlue;
  border-bottom: 2px solid $SpeckleBlue;
  cursor: pointer;
}
</style>
