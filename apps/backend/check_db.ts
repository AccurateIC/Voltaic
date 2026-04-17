import db from '@adonisjs/lucid/services/db'
import Archive from '#models/archive'
import logger from "@adonisjs/core/services/logger";
async function check() {
  const latest = await Archive.query().orderBy('created_at', 'desc').limit(5)
 logger.info({ latest }, "Latest archive records");
  process.exit(0)
}

check()
