<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-text-field
          solo
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
    </v-flex>
    <v-flex xs12>
      <v-data-table
        :items='projects'
        :headers='headers'
        :loading='isGettingProjectData'
        :search='search'
        v-model="selected"
        item-key="name"
        select-all
      >
        <template v-slot:items="props">
          <tr :active="props.selected" @click="props.selected = !props.selected">
            <td>
              <v-checkbox
                :input-value="props.selected"
                primary
                hide-details
              ></v-checkbox>
            </td>
            <td>{{ props.item.name }}</td>
            <td >{{ props.item.owner }}</td>
            <td >{{ props.item.streams.length }}</td>
            <td >{{ props.item.private }}</td>
            <td >{{ props.item.permissions.canRead.length + 1 }}</td>
            <td >{{ props.item.permissions.canWrite.length + 1}}</td>
            <td>
              <v-btn small color='primary' :to='"/projects/"+props.item._id'>Details</v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>
<script>
import debounce from 'lodash.debounce'
import union from 'lodash.union'
import Axios from 'axios'
import uuid from 'uuid/v4'

export default {
  name: 'AdminProjectsView',
  components: {
  },
  watch: {
  },
  computed: {
    projects( ) {
      return this.projectsResource.filter(project => project.deleted === false ).sort( ( a, b ) => {
        return new Date( b.updatedAt ) - new Date( a.updatedAt );
      } )
    },
    

  },
  data( ) {
    return {
      projectsResource: [],
      isGettingProjectData: false,
      selected: [],
      search: "",
      headers: [
        { text: 'Name', value: 'name'},
        { text: 'Owner', value: 'owner' },
        { text: 'Streams', value: 'streams.length'},
        { text: 'Private', value: 'private' },
        { text: 'Read Access Users:', value: 'permissions.canRead.length'},
        { text: 'Write Access Users:', value: 'permissions.canWrite.length'},
        { text: 'Actions', value: ''}

      ],
    }
  },
  methods: {
    fetchData() {
      this.isGettingProjectData = true
      Axios.get( 'projects/admin' )
        .then( res => {
          this.projectsResource = res.data.resources
          this.isGettingProjectData = false
        } )
        .catch( err => {
          this.isGettingProjectData = false
          // TODO: Handle error
          console.error( err )
        } )
    },
    ownerName(owner){
      Axios.get( `accounts/${owner}` )
        .then( res => {
          console.log(res.data.resource)
          return res.data.resource.name + " " + res.data.resource.surname
        } )
        .catch( err => {
          // TODO: Handle error
          console.error( err )
          return "Coundn't get name"
        } )
    }
  },
  mounted( ) {
    this.fetchData()
  }
}

</script>
<style scoped lang='scss'>
.detail-card {
  margin-bottom: 20px;
}

.md-content {
  padding: 30px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
}

.md-card-content {
  padding: 0;
}

a:hover {
  cursor: pointer;
}

</style>
