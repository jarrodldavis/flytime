import pino from 'pino';
import { is_development } from '../common';

export const logger = pino({
	prettyPrint: is_development && { translateTime: true },
	serializers: { err: pino.stdSerializers.err, error: pino.stdSerializers.err },
	redact: ['req.headers.cookie', 'res.headers["set-cookie"]']
});

logger.info('Logger created and ready for use');
