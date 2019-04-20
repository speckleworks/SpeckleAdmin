<template>
  <v-container grid-list-md row>
    <v-layout row wrap>
      <v-flex xs12 py-5 class='headline font-weight-light'>
        Hi {{$store.state.user.name}}! You have <router-link to='/streams'><strong>{{streams.length}}</strong> streams</router-link> and <router-link to='/projects'>
            <strong>{{projects.length}}</strong> projects</router-link> in total.
      </v-flex>
      <v-flex xs12 md6>
        <v-card class="elevation-0">
          <v-card-title>
            <v-icon left>
              import_export
            </v-icon>
            <span class="title font-weight-light">Latest Streams:</span>
          </v-card-title>
          <v-card-text>
            <v-list two-line>
              <v-list-tile v-for='stream in latestStreams' :to='"/streams/" + stream.streamId' :key='stream.streamId'>
                <v-list-tile-content>
                  <v-list-tile-title>
                    <code>{{stream.streamId}}</code>
                    &nbsp<v-icon small>{{stream.private ? "lock" : "lock_open"}}</v-icon>
                    {{stream.name}}
                  </v-list-tile-title>
                  <v-list-tile-sub-title class='xxx-font-weight-thin caption'>
                    last changed <timeago :datetime='stream.updatedAt'></timeago>, created on {{new Date( stream.createdAt ).toLocaleString()}}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn to='/streams/' class=''>See all your {{streams.length}} streams</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
      <v-flex xs12 md6>
        <v-card class="elevation-0">
          <v-card-title>
            <v-icon left>
              business
            </v-icon>
            <span class="title font-weight-light">Latest Projects</span>
          </v-card-title>
          <v-card-text>
            <v-list two-line>
              <v-list-tile v-for='project in latestProjects' :to='"/projects/" + project._id' :key='project._id'>
                <v-list-tile-content>
                  <v-list-tile-title>
                    <!-- <code>{{stream.streamId}}</code> -->
                    <v-icon small>person</v-icon> <span class='caption'>{{project.canRead.length}}</span>
                    <v-icon small>import_export</v-icon> <span class='caption'>{{project.streams.length}}</span>
                    {{project.name}}
                  </v-list-tile-title>
                  <v-list-tile-sub-title class='xxx-font-weight-thin caption'>
                    last changed <timeago :datetime='project.updatedAt'></timeago>, created on {{new Date( project.createdAt ).toLocaleString()}}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn to='/projects/' class=''>See all your {{this.$store.state.projects.length}} projects</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
  <!-- <div class='md-layout'>
    <md-card class="md-elevation-0 md-layout-item md-size-60 md-small-size-100">
      <md-card-content>
        <h1 class='title'></h1>
        <h2 class='display-1'>
          Hello {{$store.state.user.name}}! You have <router-link to='/streams'><strong>{{streams.length}}</strong> streams</router-link> and <router-link to='/projects'>
            <strong>{{projects.length}}</strong> projects</router-link> in total.
        </h2>
        <br>
        <v-divider></v-divider>
        <p style="line-height: 50px;" v-if='latestStreams.length>0'>Your latest streams:
          <span v-for='stream in latestStreams' style="margin:5px;">
            <router-link :to='"/streams/" + stream.streamId'>
              <md-chip class='md-primary md-elevation-5' md-clickable> <strong>{{stream.name}}</strong>
              </md-chip>
            </router-link>
          </span>
          <router-link to='/streams'>more...</router-link>
        </p>
        <p v-else>You don't seem to have any streams. You can create them either via the existing <router-link to='/plugins'> application plugins</router-link> or right <router-link to='streams'>here!</router-link>
        </p>
        <p class='md-caption'> What are streams? Streams are the place where your design data lives: geometry, complex objects and other information come together here, either from any of the <router-link to='/plugins'>supported applications</router-link>, or created online to serve as central repositories for design parameters.</p>
        <br>
        <md-divider></md-divider>
        <p style="line-height: 50px;" v-if='latestProjects.length > 0'>Your latest projects:
          <span v-for='project in latestProjects' style="margin:5px;">
            <router-link :to='"/projects/" + project._id'>
              <md-chip class='md-primary md-elevation-5' md-clickable> <strong>{{project.name}}</strong>
              </md-chip>
            </router-link>
          </span>
          <router-link to='/projects'>more...</router-link>
        </p>
        <p v-else>You don't seem to have any projects. You can create them right <router-link to='projects'>here!</router-link>
        </p>
        <p class='md-caption'> What are projects? Projects help you group streams and teams together, and share permissions in bulk. This also allows you to group your streams in logical categories that you define.</p>
        <br>
        <md-divider></md-divider>
        <br>
        <p class="md-caption">Did you know that: <span class='catFact' @click='getAFact()' v-html='currentCatFact'></span></p>
      </md-card-content>
    </md-card>
  </div> -->
</template>
<script>
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'HomeView',
  components: {},
  computed: {
    latestStreams( ) {
      return this.streams.slice( 0, 7 )
    },
    latestProjects( ) {
      return this.projects.slice( 0, 7 )
    },
    projects( ) {
      return this.$store.state.projects.filter( p => p.deleted === false )
    },
    streams( ) {
      return this.$store.state.streams.filter( stream => stream.parent == null && stream.deleted === false ).sort( ( a, b ) => {
        return new Date( b.updatedAt ) - new Date( a.updatedAt );
      } )
    },
    currentCatFact( ) {
      return this.facts[ this.currentFact ].fact
    }
  },
  methods: {
    getAFact( ) {
      let min = 0
      let max = this.facts.length - 1
      this.currentFact = Math.floor( Math.random( ) * ( max - min + 1 ) ) + min
    }
  },
  data( ) {
    return {
      currentFact: 0,
      facts: [ {
          "fact": "Cats come back to full alertness from the sleep state faster than any other creature."
        },
        {
          "fact": "Cats have supersonic hearing"
        },
        {
          "fact": "A cat's normal pulse is 140-240 beats per minute, with an average of 195."
        },
        {
          "fact": "A happy cat holds her tail high and steady."
        },
        {
          "fact": "It has been scientifically proven that stroking a cat can lower one's blood pressure."
        },
        {
          "fact": "A cat usually has about 12 whiskers on each side of its face."
        },
        {
          "fact": "Cats spend nearly 1/3 of their waking hours cleaning themselves."
        },
        {
          "fact": "A healthy cat has a temperature between 38 and 39 degrees Celcius."
        },
        {
          "fact": "On average, a cat will sleep for 16 hours a day."
        },
        {
          "fact": "Cats can jump up to 7 times their tail length."
        },
        {
          "fact": "Cats dislike citrus scent."
        },
        {
          "fact": "Cats walk on their toes."
        },
        {
          "fact": "A cat's field of vision is about 200 degrees."
        },
        {
          "fact": "Julius Ceasar, Henri II, Charles XI, and Napoleon were all afraid of cats."
        },
        {
          "fact": "The first cat show was organized in 1871 in London. Cat shows later became a worldwide craze."
        },
        {
          "fact": "A cat can sprint at about thirty-one miles per hour."
        },
        {
          "fact": "The cat's footpads absorb the shocks of the landing when the cat jumps."
        },
        {
          "fact": "Most cats adore sardines."
        },
        {
          "fact": "Cats purr at the same frequency as an idling diesel engine, about 26 cycles per second."
        },
        {
          "fact": "A cat can travel at a top speed of approximately 31 mph (49 km) over a short distance."
        },
        {
          "fact": "A cat has two vocal chords, and can make over 100 sounds."
        },
        {
          "fact": "A cat’s heart beats nearly twice as fast as a human heart, at 110 to 140 beats a minute."
        },
        {
          "fact": "Speckle is frequently misspelled as Speck, which means bacon in german."
        },
        {
          "fact": "Speckle has a <a href='https://twitter.com/speckle_works' target='_blank'>twitter account you should follow!</a>"
        }, {
          "fact": "Speckle is a recursive acronym for <strong>S</strong>peckle <strong>P</strong>refers <strong>E</strong>ating <strong>C</strong>hives, <strong>K</strong>ale, <strong>L</strong>ime, and <strong>E</strong>ggplant."
        },
        {
          "fact": "Speckle is a recursive acronym for <strong>S</strong>peckle <strong>P</strong>owered <strong>E</strong>ngines <strong>C</strong>urrently <strong>K</strong>nead <strong>L</strong>inear <strong>E</strong>nergies."
        },
        {
          "fact": "Speckle is a recursive acronym for <strong>S</strong>peckle <strong>P</strong>lanted <strong>E</strong>ggs <strong>C</strong>onvert <strong>K</strong>ey <strong>L</strong>anguage <strong>E</strong>rrors."
        },
        {
          "fact": "Speckle is a recursive acronym for <strong>S</strong>peckled, <strong>P</strong>urring, and <strong>E</strong>ffervescent <strong>C</strong>ats <strong>K</strong>indly <strong>L</strong>ick <strong>E</strong>ars."
        }
      ]
    }
  }
}

</script>
<style scoped lang='scss'>
.catFact {
  /*padding: 2px 10px;*/
  cursor: pointer;
  user-select: none;
}

</style>
