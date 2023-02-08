import EventEmitter from 'events';
import { type Interface, type ReadLineOptions, createInterface } from 'readline';
import type TypedEmitter from 'typed-emitter';
import { type EventMap } from 'typed-emitter';
import { clearLine as clr } from './lib/clearLine.js';

interface MsgData {
	msg: string
	sender?: string

	other?: Record<string, unknown>
}

interface ChatEvents extends EventMap {
	msgSent: (data: MsgData) => void
	msgReceived: (data: MsgData) => void
}

export class Chat {
	public readline: Interface;
	public readonly events = new EventEmitter() as TypedEmitter<ChatEvents>;
	private readonly rlOpts;

	constructor (options?: {
		readLineOpts?: ReadLineOptions
		username?: string
	}) {
		const DEFAULT_RL_OPTS: ReadLineOptions = {
			input: process.stdin,
			output: process.stdout,
			terminal: true,
			prompt: '> '
		};
		this.rlOpts = options?.readLineOpts ? options.readLineOpts : DEFAULT_RL_OPTS;

		// Setup readline
		this.readline = createInterface(this.rlOpts);
		this.readline.prompt();
		this.readline.on('line', (input: string) => {
			this.events.emit('msgSent', ({ msg: input, sender: options?.username }));
		});
	}

	sendMsg (data: MsgData): boolean {
		return this.events.emit('msgSent', data);
	}

	print (str: string, options?: {
		/*
		 * Move down the input when printing
		*/
		resetCursor?: boolean
		preserveLine?: boolean
		clearLine?: boolean
	}): void {
		if (!this.rlOpts.output) {
			return;
		}

		const { resetCursor = true, preserveLine = true, clearLine = true } = options ?? {};

		if (resetCursor && clearLine) {
			clr(this.rlOpts.output, true);
		}

		// Print
		this.rlOpts.output.write(str);

		// Move down the chat prompt
		if (resetCursor) {
			this.rlOpts.output.write('\n');
			this.readline.prompt(preserveLine);
		}
	}
}
