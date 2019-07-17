<template>
  <v-card>
    <v-container>
      <v-card-title>
        <span class="headline font-weight-light">Edit User</span>
        <v-spacer />
        <v-btn icon @click="closeDialog">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-title>
        <v-flex xs12>
          <v-form>
            <v-layout row wrap>
              <v-flex xs12 md6>
                <v-text-field v-model="user.name" label="Name" required></v-text-field>
              </v-flex>
              <v-flex xs12 md6>
                <v-text-field v-model="user.surname" label="Surname" required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="user.email" label="Email" required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-text-field v-model="user.company" label="Company" required></v-text-field>
              </v-flex>
              <v-flex xs12>
                <v-select v-model="user.role" :items="['user', 'admin']" label="Role" required></v-select>
              </v-flex>
            </v-layout>
          </v-form>
          <v-progress-linear indeterminate v-if="showProgress" />
        </v-flex>
      </v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" :disabled="true">Reset Password</v-btn>
        <v-btn color="red" @click="deleteUser">Delete</v-btn>
        <v-btn color="primary" @click="saveUser" :disabled="!valid">Save</v-btn>
      </v-card-actions>
    </v-container>
  </v-card>
</template>
<script>
import Axios from 'axios'

export default {
  name: "UserEditCard",
  props: {
    user: Object
  },
  computed: {
    valid() {
      if (
        this.user.name.length < 1 ||
        this.user.surname.length < 1 ||
        this.user.company.length < 1 ||
        (this.user.role != "admin" && this.user.role != "user") ||
        this.user.email.length < 1
      ) {
        //TODO real email validation
        return false;
      }
      return true;
    }
  },
  data() {
    return {
      showProgress: false
    };
  },
  methods: {
    saveUser() {
      this.showProgress = true
      let payload = {
        name: this.user.name,
        surname: this.user.surname,
        company: this.user.company,
        email: this.user.email,
        role: this.user.role
      };
      let self = this
      Axios.put("accounts/" + this.user._id, payload).then(res => {
        self.showProgress = false
        if (res.data.success === true){
          return self.$emit("close-dialog-success")
        }
        return console.error("Unable to update user")
      })
    },
    deleteUser() {
      console.log("deleteUser is not implemented");
    },
    closeDialog() {
      this.$emit("close-dialog");
    }
  },
};
</script>
<style scoped lang='scss'>
</style>
