declare module 'admiral-cli' {
	class Cli {
		constructor(...params:any[]);
		commandGroup(...params:any[]):any;
		option(...params:any[]):any;
		parse(...params:any[]):any;
		public params:any;
	}

	class CliCommand {
		constructor(...params:any[]);
	}

	class InvalidInputError {

	}

	class ConfigError {

	}
}