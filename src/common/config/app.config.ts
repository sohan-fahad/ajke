export interface AppConfig {
	port: number;
	environment: string;
	cors: {
		origin: string[];
		credentials: boolean;
	};
	security: {
		rateLimit: {
			windowMs: number;
			max: number;
		};
	};
	logging: {
		level: string;
		enableRequestLogging: boolean;
	};
}

export const appConfig: AppConfig = {
	port: 3000, // Cloudflare Workers don't use ports
	environment: "production", // Cloudflare Workers run in production
	cors: {
		origin: ["*"], // Default to allow all origins
		credentials: false,
	},
	security: {
		rateLimit: {
			windowMs: 900000,
			max: 100,
		},
	},
	logging: {
		level: "info",
		enableRequestLogging: true,
	},
};
