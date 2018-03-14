<template>
  <div class="spk-permissions-dialgoue">
    <md-content>
      <div class="md-layout">
        <div class="md-layout-item" style="padding:30px">
          <md-field>
            <md-icon>add</md-icon>
            <md-input v-model="searchfilter"></md-input>
          </md-field>
        </div>
      </div>
      <div class="md-layout">
        <div class="md-layout-item">
          <md-table v-model="users" md-fixed-header>
            <md-table-row slot="md-table-row" slot-scope="{ item }">
              <md-table-cell md-label="Name" md-sort-by="name"><strong>{{ item.name }}</strong></md-table-cell>
              <md-table-cell md-label="Email" md-sort-by="email"><small>{{ item.email }}</small></md-table-cell>
              <md-table-cell md-label="Company" md-sort-by="title"><small>{{ item.title }}</small></md-table-cell>
              <md-table-cell md-label="Read" md-sort-by="title">
                <md-checkbox v-model="item.read"></md-checkbox>
              </md-table-cell>
              <md-table-cell md-label="Write" md-sort-by="title">
                <md-checkbox v-model="item.write"></md-checkbox>
              </md-table-cell>
              <!--               <md-table-cell md-label="Comment" md-sort-by="title">
                <md-checkbox v-model="item.comment"></md-checkbox>
              </md-table-cell> -->
            </md-table-row>
          </md-table>
        </div>
      </div>
      <div class="md-layout">
        <div class="md-layout-item">
          <md-button class='md-primary md-raised'>Done</md-button>
        </div>
      </div>
    </md-content>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  props: [ 'streamId' ],
  computed: {
    ...mapGetters( [ 'streamById' ] ),
    stream( ) {
      return this.streamById( this.streamId )
      // return this.streamId
    }
  },
  data( ) {
    return {
      searchfilter: null,
      users: [ {
          id: 122,
          name: 'Shawna Dubbin',
          email: 'sdubbin0@geocities.com',
          gender: 'Male',
          title: 'Assistant Media Planner',
          read: false,
          write: true,
          comment: true
        }, {
          id: 10,
          name: 'Shawna Dubbin',
          email: 'sdubbin0@geocities.com',
          gender: 'Male',
          title: 'Assistant Media Planner',
          read: false,
          write: true,
          comment: true
        }, {
          id: 9,
          name: 'Shawna Dubbin',
          email: 'sdubbin0@geocities.com',
          gender: 'Male',
          title: 'Assistant Media Planner',
          read: false,
          write: true,
          comment: true
        }, {
          id: 3,
          name: 'Shawna Dubbin',
          email: 'sdubbin0@geocities.com',
          gender: 'Male',
          title: 'Assistant Media Planner',
          read: false,
          write: true,
          comment: true
        }, {
          id: 44,
          name: 'Shawna Dubbin',
          email: 'sdubbin0@geocities.com',
          gender: 'Male',
          title: 'Assistant Media Planner',
          read: false,
          write: true,
          comment: true
        }, {
          id: 333,
          name: 'Shawna Dubbin',
          email: 'sdubbin0@geocities.com',
          gender: 'Male',
          title: 'Assistant Media Planner',
          read: false,
          write: true,
          comment: true
        },
        {
          id: 2,
          name: 'Odette Demageard',
          email: 'odemageard1@spotify.com',
          gender: 'Female',
          title: 'Account Coordinator',
          read: false,
          write: true,
          comment: true
        }
      ]
    }
  }
}

</script>
<style lang="scss">
.spk-permissions-dialgoue {
  // padding: 20px;
  min-width: 1024px;
}

</style>
