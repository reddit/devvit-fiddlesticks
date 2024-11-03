import {Devvit} from '@devvit/public-api'
import {App} from './app/components/app.js'
import {submitNewPost} from './app/utils/post.js'
import {redisSchemaVersion} from './app/utils/redis.js'

const upgrade: boolean = true

Devvit.configure({realtime: true, redis: true, redditAPI: true})

Devvit.addCustomPostType({name: 'Corridor', height: 'tall', render: App})

Devvit.addMenuItem({
  label: 'Make Corridor',
  location: 'subreddit',
  onPress: async (_ev, ctx) => submitNewPost(ctx)
})

Devvit.addTrigger({
  event: 'AppUpgrade',
  onEvent(_ev, _ctx) {
    if (upgrade) {
      console.log(`upgrading app to schema v${redisSchemaVersion}`)
      // to-do: schedule n updates for post preview and redis.
      // post.setCustomPostPreview(…)
    }
  }
})

export default Devvit
