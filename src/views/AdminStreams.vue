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
        :items="streams"
        :headers="headers"
        :loading="isGettingStreamData"
        :search="search"
        v-model="selected"
        item-key="name"
        select-all
      >
        <template v-slot:items="props">
          <tr :active="props.selected" @click="props.selected = !props.selected">
            <td>
              <v-checkbox :input-value="props.selected" primary hide-details></v-checkbox>
            </td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.streamId }}</td>
            <td>{{ props.item.owner }}</td>
            <td>{{ props.item.private }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>
<script>
import debounce from "lodash.debounce";
import union from "lodash.union";
import Axios from "axios";
import uuid from "uuid/v4";
import papa from "papaparse";

export default {
  name: "AdminStreamsView",
  components: {},
  watch: {},
  computed: {
    streams() {
      return this.streamsResource
        .filter(stream => stream.parent == null && stream.deleted === false)
        .sort((a, b) => {
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
    }
  },
  data() {
    return {
      streamsResource: [],
      isGettingStreamData: false,
      selected: [],
      search: "",
      headers: [
        { text: "Name", value: "name" },
        { text: "Id", value: "streamdId" },
        { text: "Owner", value: "owner" },
        { text: "Private", value: "private" }
      ]
    };
  },
  methods: {
    fetchData() {
      this.isGettingStreamData = true;
      Axios.get("streams/admin")
        .then(res => {
          this.streamsResource = res.data.resources;
          this.isGettingStreamData = false;
        })
        .catch(err => {
          this.isGettingStreamData = false;
          // TODO: Handle error
          console.error(err);
        });
    }
  },
  mounted() {
    this.fetchData();
  }
};
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
