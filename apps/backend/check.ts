import db from '@adonisjs/lucid/services/db'
import Notification from '#models/notification'
import Archive from '#models/archive'
import logger from '@adonisjs/core/services/logger'

export default class CheckRecent {
  static async run() {
    logger.info('--- RECENT ANOMALIES FROM ARCHIVE ---')

    const archives = await Archive.query()
      .where('isAnomaly', 1)
      .orderBy('timestamp', 'desc')
      .limit(5)
      .preload('gensetProperty')

    archives.forEach((a) => {
      logger.info(
        {
          timestamp: a.timestamp,
          propertyName: a.gensetProperty?.propertyName,
          propertyValue: a.propertyValue,
        },
        'Recent anomaly record'
      )
    })

    logger.info('--- RECENT NOTIFICATIONS ---')

    const notifs = await Notification.query()
      .orderBy('id', 'desc')
      .limit(5)
      .preload('archive')

    notifs.forEach((n) => {
      logger.info(
        {
          startedAt: n.startedAt,
          summary: n.summary,
          shouldBeDisplayed: n.shouldBeDisplayed,
          finishedAt: n.finishedAt,
        },
        'Recent notification'
      )
    })

    process.exit(0)
  }
}