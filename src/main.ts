import {
  type Context,
  Devvit,
  type FormKey,
  type FormOnSubmitEvent
} from '@devvit/public-api'
import {App} from './app/components/app.js'
import {submitNewPost} from './app/utils/post.js'

const newMatchScheduleJob: string = 'NewMatchSchedule'

Devvit.configure({redis: true, redditAPI: true})

Devvit.addCustomPostType({name: 'Fiddlesticks', height: 'tall', render: App})

Devvit.addMenuItem({
  label: 'New Fiddlesticks Match',
  location: 'subreddit',
  onPress: (_ev, ctx) => submitNewPost(ctx, true)
})

const matchScheduleForm: FormKey = Devvit.createForm(
  {
    acceptLabel: 'Save',
    fields: [
      {name: 'enabled', label: 'Enabled', required: true, type: 'boolean'},
      {name: 'mins', label: 'Every x Minutes', required: true, type: 'number'}
    ],
    title: 'Fiddlesticks Match Schedule'
  },
  onSaveSchedule
)

async function onSaveSchedule(
  ev: FormOnSubmitEvent<{enabled: boolean; mins: number}>,
  ctx: Context
): Promise<void> {
  const {enabled, mins} = ev.values
  for (const job of await ctx.scheduler.listJobs()) {
    console.log(`canceling job ${job.id} / ${job.name}`)
    await ctx.scheduler.cancelJob(job.id)
  }

  if (!enabled || mins <= 0 || !Number.isInteger(mins)) {
    console.log('unscheduled recurring matches')
    ctx.ui.showToast('Unscheduled recurring Fiddlesticks matches.')
    return
  }

  await ctx.scheduler.runJob({
    name: newMatchScheduleJob,
    cron: `*/${mins} * * * *`
  })
  ctx.ui.showToast(
    `Scheduled recurring Fiddlesticks matches every ${mins} minute(s).`
  )
  console.log(`scheduled recurring matches every ${mins} minute(s)`)
}

Devvit.addSchedulerJob<undefined>({
  name: newMatchScheduleJob,
  onRun: (_ev, ctx) => submitNewPost(ctx, false)
})

Devvit.addMenuItem({
  label: 'Schedule / Cancel Recurring Fiddlesticks Matches',
  location: 'subreddit',
  onPress: (_ev, ctx) => ctx.ui.showForm(matchScheduleForm)
})

// to-do: probably better to schema upgrade when viewing a post than on app
// upgrade trigger to avoid having to partition across scheduled jobs? should
// include post.setCustomPostPreview(…).

export default Devvit
