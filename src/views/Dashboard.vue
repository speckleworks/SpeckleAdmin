<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12 py-5 class='headline font-weight-light' v-if='streams.length !== 0 || projects.length !== 0'>
        👋 Hi {{$store.state.user.name}}! You have <router-link to='/streams'><strong>{{streams.length}}</strong> streams</router-link> and <router-link to='/projects'>
          <strong>{{projects.length}}</strong> projects</router-link> in total.
      </v-flex>
      <v-flex xs12 py-5 class='' v-if='streams.length === 0 && projects.length === 0'>
        <div class='headline font-weight-light mb-4'>
          👋 Hello {{$store.state.user.name}}! You seem short on <i>data</i> - maybe it's your first time here. If so, why don't you check out the <a href='https://www.speckle.works/log/speckle-guide' target='_blank'>guide for dynamo and grasshopper</a>?
        </div>
        <v-divider></v-divider>
        <div class='mt-4 subheading'>
          You can also get in touch with the rest of the speckle community via:
          <ul>
            <li><a href='https://discourse.speckle.works' target="_blank">Discourse</a></li>
            <li><a href='https://slacker.speckle.works' target="_blank">Slack</a></li>
            <li><a href='https://twitter.com/speckle_works' target="_blank">Twitter</a></li>
          </ul>
        </div>
      </v-flex>
      <v-flex xs12 md6 v-if='streams.length !== 0 || projects.length !== 0'>
        <v-card class="elevation-0">
          <v-card-title>
            <v-icon left>
              import_export
            </v-icon>
            <span class="title font-weight-light">Latest Streams</span>
          </v-card-title>
          <v-card-text>
            <v-list two-line>
              <v-list-tile v-for='stream in latestStreams' :to='"/streams/" + stream.streamId' :key='stream.streamId'>
                <v-list-tile-content>
                  <v-list-tile-title>
                    <span class='caption'>
                      <v-icon small>fingerprint</v-icon> {{stream.streamId}}
                      &nbsp;<v-icon small>{{stream.private ? "lock" : "lock_open"}}</v-icon>
                    </span>&nbsp;
                    <span class='text-capitalize'>{{stream.name}}</span>
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
      <v-flex xs12 md6 v-if='streams.length !== 0 || projects.length !== 0'>
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
