const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs = require('fs');

const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.errors({ stack: true }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf((info) => {
      const { timestamp, level, message, stack } = info;
      const splat = info[Symbol.for('splat')] || [];
      const extra = splat
        .map((data) =>
          data instanceof Error ? data.stack || data.message : typeof data === 'object' ? JSON.stringify(data) : data
        )
        .join(' ');
      const meta = stack || extra;
      return `${timestamp} [${level}] ${message}${meta ? ' ' + meta : ''}`;
    })  ),
  transports: [
    new transports.File({ filename: path.join(logDir, 'app.log') }),
    new transports.Console()
  ]
});

logger.stream = {
  write: (message) => logger.http(message.trim())
};

module.exports = logger;