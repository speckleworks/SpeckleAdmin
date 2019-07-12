<template>
  <v-layout row wrap>
    <v-flex xs12>
      <v-data-table
        :items='streams'
        :headers='headers'
        :loading='isGettingUsersData'
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
            <td>{{ props.item.email }}</td>
            <td>{{ props.item.name }}</td>
            <td >{{ props.item.surname }}</td>
            <td >{{ props.item.company }}</td>
            <td>{{ props.item.createdAt }}</td>
            <td>{{ props.item.logins.length }}</td>
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
import papa from 'papaparse'

export default {
  name: 'AdminUsersView',
  components: {
  },
  watch: {
  },
  computed: {
    streams( ) {
      return this.usersResource
    },
  },
  data( ) {
    return {
      usersResource: [],
      isGettingUsersData: false,
      selected: [],
      headers: [
        { text: 'Email', value: 'email'},
        { text: 'Name', value: 'name'},
        { text: 'Surname', value: 'surname' },
        { text: 'Organization', value: 'organization'},
        { text: 'Joined', value: 'name'},
        { text: 'Logins', value: 'logins.length' },
      ],
    }
  },
  methods: {
    fetchData() {
      this.isGettingUsersData = true
      Axios.get( 'accounts/admin' )
        .then( res => {
          this.usersResource = res.data.resource
          this.isGettingUsersData = false
        } )
        .catch( err => {
          this.isGettingUsersData = false
          // TODO: Handle error
          console.error( err )
        } )
    },
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
