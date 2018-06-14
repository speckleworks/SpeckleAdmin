<template>
  <div class='' style="padding: 20px;">
    <h1>Profile</h1>
    <div class="md-layout md-alignment-center-center spk-cell">
      <div class="md-layout-item md-subheading">
        <!-- {{fullname}} -->
        <editable :value='fullname' @setValue='setName'></editable>
      </div>
      <div class="md-layout-item md-size-30 md-caption">name</div>
    </div>
    <div class="md-layout md-alignment-center-center spk-cell">
      <div class="md-layout-item md-subheading">
        <editable :value='user.company' @setValue='setCompany'></editable>
      </div>
      <div class="md-layout-item md-size-30 md-caption">company</div>
    </div>
    <div class="md-layout md-alignment-center-center spk-cell">
      <div class="md-layout-item md-caption"><strong>{{user.email}}</strong></div>
      <div class="md-layout-item md-size-30 md-caption">email</div>
    </div>
    <div class="md-layout md-alignment-center-center spk-cell">
      <div class="md-layout-item md-caption"><strong>{{user.createdAt | formatDate}}</strong></div>
      <div class="md-layout-item md-size-30 md-caption">member since</div>
    </div>
    <div class="md-layout md-alignment-center-center spk-cell">
      <md-button class='md-dense md-accent' style='width:100%; min-height:60px;'@click='logout'>Logout</md-button>
    </div>
  </div>
</template>
<script>
import debounce from 'lodash.debounce'
import Editable from './Editable.vue'

export default {
  components: {
    Editable
  },
  props: [ ],
  watch: {
  },
  computed: {
    fullname: {
      get( ) {
        return this.user.name + ' ' + this.user.surname
      }
    },
    user( ) { return this.$store.state.user }
  },
  data( ) {
    return {
      eName: '',
      eSurname: '',
      eComp: ''
    }
  },
  methods: {
    setName( val ) {
      let names = val.split( ' ' )
      this.eName = names[ 0 ]
      this.eSurname = names[ 1 ]
      this.$store.dispatch( 'patchUser', { data: { name: this.eName, surname: this.eSurname } } )
    },
    setCompany( val ) {
      this.eCompany = val
      this.$store.dispatch( 'patchUser', { data: { company: this.eCompany } } )
    },
    logout( ) {
      this.$store.commit( 'setCredentials', { auth: false, token: null } )
      window.localStorage.clear( )
    },
  },
  mounted( ) {}
}

</script>
<style lang="scss">


</style>
