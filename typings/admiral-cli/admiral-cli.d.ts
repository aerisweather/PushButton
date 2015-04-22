declare module AdmiralCli {
	class Cli {
		constructor(...params:any[]);
		commandGroup(...params:any[]):any;
		option(...params:any[]):any;
		parse(...params:any[]):any;
		public params:any;

		public static CliCommand:typeof CliCommand;

		public static InvalidInputError:typeof InvalidInputError;

		public static ConfigError:typeof ConfigError;
	}

	class CliCommand {
		constructor(...params:any[]);
	}

	class InvalidInputError {

	}

	class ConfigError {

	}
}

declare module 'admiral-cli' {
	export = AdmiralCli.Cli;
}
