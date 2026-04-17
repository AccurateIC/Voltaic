import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class Check extends BaseCommand {
  static commandName = 'check'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const { default: Notification } = await import('#models/notification')
    const { default: Archive } = await import('#models/archive')
    const fs = await import('fs')

    const activeNotifs = await Notification.query()
      .whereNull('finishedAt')
      .preload('archive')
    const notifData = activeNotifs.map(n => ({
      startedAt: n.startedAt,
      summary: n.summary,
      displayed: n.shouldBeDisplayed,
      finishedAt: n.finishedAt
    }));

    fs.writeFileSync('check_out2.json', JSON.stringify({ activeNotifications: notifData }, null, 2))
  }
}