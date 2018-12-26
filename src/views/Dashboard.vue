<template>
  <div class='md-layout'>
    <md-card class="md-elevation-0 md-layout-item md-size-60 md-small-size-100">
      <md-card-content>
        <h1 class='md-display-2'>Hello {{$store.state.user.name}}!</h1>
        <h2 class='md-title'>You have <router-link to='/streams'><md-chip class='md-primary md-elevation-5' md-clickable><md-icon style='color:white;font-size: 16px !important;'>import_export</md-icon><strong>{{streams.length}}</strong>  streams &nbsp</md-chip></router-link> and <router-link to='/projects'>
          <md-chip class='md-primary md-elevation-5' md-clickable><md-icon style='color:white;font-size: 16px !important;'>business</md-icon><strong>{{projects.length}}</strong>  projects &nbsp</md-chip></router-link> in total.

        </h2>
        <br>
        <md-divider></md-divider>
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
        <p class="md-caption" @click='getAFact()'>Did you know: {{currentCatFact}}</p>
      </md-card-content>
    </md-card>
  </div>
</template>
<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'HomeView',
  components: {},
  computed: {
    latestStreams( ) {
      return this.streams.slice( 0, 5 )
    },
    latestProjects( ) {
      return this.projects.slice( 0, 5 )
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
          "fact": "The first official cat show in the UK was organised at Crystal Palace in 1871.",
          "length": 78
        },
        {
          "fact": "Tylenol and chocolate are both poisionous to cats.",
          "length": 50
        },
        {
          "fact": "A cat's normal temperature varies around 101 degrees Fahrenheit.",
          "length": 64
        },
        {
          "fact": "Cats come back to full alertness from the sleep state faster than any other creature.",
          "length": 85
        },
        {
          "fact": "In one stride, a cheetah can cover 23 to 26 feet (7 to 8 meters).",
          "length": 65
        },
        {
          "fact": "In the original Italian version of Cinderella, the benevolent fairy godmother figure was a cat.",
          "length": 95
        },
        {
          "fact": "Cats can be right-pawed or left-pawed.",
          "length": 38
        },
        {
          "fact": "In multi-cat households, cats of the opposite sex usually get along better.",
          "length": 75
        },
        {
          "fact": "Cats make about 100 different sounds. Dogs make only about 10.",
          "length": 62
        },
        {
          "fact": "Cats have supersonic hearing",
          "length": 28
        },
        {
          "fact": "Ailurophile is the word cat lovers are officially called.",
          "length": 57
        },
        {
          "fact": "A cat's normal pulse is 140-240 beats per minute, with an average of 195.",
          "length": 75
        },
        {
          "fact": "Cats see six times better in the dark and at night than humans.",
          "length": 63
        },
        {
          "fact": "An adult lion's roar can be heard up to five miles (eight kilometers) away.",
          "length": 75
        },
        {
          "fact": "A cat's hearing is much more sensitive than humans and dogs.",
          "length": 60
        },
        {
          "fact": "A happy cat holds her tail high and steady.",
          "length": 43
        },
        {
          "fact": "One reason that kittens sleep so much is because a growth hormone is released only during sleep.",
          "length": 96
        },
        {
          "fact": "It has been scientifically proven that stroking a cat can lower one's blood pressure.",
          "length": 85
        },
        {
          "fact": "According to a Gallup poll, most American pet owners obtain their cats by adopting strays.",
          "length": 90
        },
        {
          "fact": "A cat usually has about 12 whiskers on each side of its face.",
          "length": 61
        },
        {
          "fact": "Cats spend nearly 1/3 of their waking hours cleaning themselves.",
          "length": 64
        },
        {
          "fact": "Cats have 300 million neurons; dogs have about 160 million",
          "length": 58
        },
        {
          "fact": "A cat lover is called an Ailurophilia (Greek: cat+lover).",
          "length": 57
        },
        {
          "fact": "Cats can judge within 3 inches the precise location of a sound being made 1 yard away.",
          "length": 86
        },
        {
          "fact": "In contrast to dogs, cats have not undergone major changes during their domestication process.",
          "length": 94
        },
        {
          "fact": "Today there are about 100 distinct breeds of the domestic cat.",
          "length": 62
        },
        {
          "fact": "A healthy cat has a temperature between 38 and 39 degrees Celcius.",
          "length": 66
        },
        {
          "fact": "When a cat drinks, its tongue - which has tiny barbs on it - scoops the liquid up backwards.",
          "length": 92
        },
        {
          "fact": "There are up to 60 million feral cats in the United States alone.",
          "length": 65
        },
        {
          "fact": "On average, a cat will sleep for 16 hours a day.",
          "length": 48
        },
        {
          "fact": "Cats can jump up to 7 times their tail length.",
          "length": 46
        },
        {
          "fact": "Jaguars are the only big cats that don't roar.",
          "length": 46
        },
        {
          "fact": "A cat will tremble or shiver when it is extreme pain.",
          "length": 55
        },
        {
          "fact": "If they have ample water, cats can tolerate temperatures up to 133 °F.",
          "length": 71
        },
        {
          "fact": "Cats dislike citrus scent.",
          "length": 26
        },
        {
          "fact": "Cats walk on their toes.",
          "length": 24
        },
        {
          "fact": "The leopard is the most widespread of all big cats.",
          "length": 51
        },
        {
          "fact": "Fossil records from two million years ago show evidence of jaguars.",
          "length": 67
        },
        {
          "fact": "A cat's field of vision is about 200 degrees.",
          "length": 45
        },
        {
          "fact": "Julius Ceasar, Henri II, Charles XI, and Napoleon were all afraid of cats.",
          "length": 74
        },
        {
          "fact": "The ancestor of all domestic cats is the African Wild Cat which still exists today.",
          "length": 83
        },
        {
          "fact": "The first cat show was organized in 1871 in London. Cat shows later became a worldwide craze.",
          "length": 93
        },
        {
          "fact": "Both humans and cats have identical regions in the brain responsible for emotion.",
          "length": 81
        },
        {
          "fact": "Blue-eyed, pure white cats are frequently deaf.",
          "length": 47
        },
        {
          "fact": "There are more than 500 million domestic cats in the world, with approximately 40 recognized breeds.",
          "length": 100
        },
        {
          "fact": "A cat can sprint at about thirty-one miles per hour.",
          "length": 52
        },
        {
          "fact": "The cat's footpads absorb the shocks of the landing when the cat jumps.",
          "length": 71
        },
        {
          "fact": "Many Egyptians worshipped the goddess Bast, who had a woman’s body and a cat’s head.",
          "length": 88
        },
        {
          "fact": "Most cats adore sardines.",
          "length": 25
        },
        {
          "fact": "After humans, mountain lions have the largest range of any mammal in the Western Hemisphere.",
          "length": 92
        },
        {
          "fact": "Heat occurs several times a year and can last anywhere from 3 to 15 days.",
          "length": 73
        },
        {
          "fact": "Cats purr at the same frequency as an idling diesel engine, about 26 cycles per second.",
          "length": 87
        },
        {
          "fact": "Cats lived with soldiers in trenches, where they killed mice during World War I.",
          "length": 80
        },
        {
          "fact": "About 37% of American homes today have at least 1 cat.",
          "length": 54
        },
        {
          "fact": "Cats have about 130,000 hairs per square inch (20,155 hairs per square centimeter).",
          "length": 83
        },
        {
          "fact": "In the 1750s, Europeans introduced cats into the Americas to control pests.",
          "length": 75
        },
        {
          "fact": "Cats have been domesticated for half as long as dogs have been.",
          "length": 63
        },
        {
          "fact": "Cats are the world's most popular pets, outnumbering dogs by as many as three to one",
          "length": 84
        },
        {
          "fact": "A cat can travel at a top speed of approximately 31 mph (49 km) over a short distance.",
          "length": 86
        },
        {
          "fact": "A cat has two vocal chords, and can make over 100 sounds.",
          "length": 57
        },
        {
          "fact": "The richest cat is Blackie who was left £15 million by his owner, Ben Rea.",
          "length": 75
        },
        {
          "fact": "Cats eat grass to aid their digestion and to help them get rid of any fur in their stomachs.",
          "length": 92
        },
        {
          "fact": "A steady diet of dog food may cause blindness in your cat - it lacks taurine.",
          "length": 77
        },
        {
          "fact": "Cheetahs do not roar, as the other big cats do. Instead, they purr.",
          "length": 67
        },
        {
          "fact": "A cat’s heart beats nearly twice as fast as a human heart, at 110 to 140 beats a minute.",
          "length": 90
        }
      ]
    }
  }
}

</script>
