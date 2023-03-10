import EventEmitter from 'events';
import { type ReadLine, type ReadLineOptions, createInterface } from 'readline';
import type TypedEmitter from 'typed-emitter';
import { type EventMap } from 'typed-emitter';
import { clearLine as clr } from './lib/clearLine.js';

/**
 * Message data object.
 */
interface MsgData {
	/**
	 * The message string.
	 */
	msg: string
	/**
	 * The sender's name.
	 */
	sender?: string
	/**
	 * Any other data associated with the message.
	 */
	other?: Record<string, unknown>
}

/**
   * Chat events emitted by Chat class.
   */
interface ChatEvents extends EventMap {
	/**
	 * Emitted when a message is sent.
	 */
	msgSent: (data: MsgData) => void
	/**
	 * Emitted when a message is received.
	 */
	msgReceived: (data: MsgData) => void
}

/**
   * Options for Chat class constructor.
   */
interface ChatOptions {
	/**
	 * Options to pass to readline.createInterface().
	 */
	readLineOpts?: ReadLineOptions
	/**
	 * The username of the user.
	 */
	username?: string
}

/**
 * Prints the given string to the specified output with optional formatting options.
 *
 * @param {string} str - The string to print.
 * @param {object} [options] - The formatting options.
 * @param {boolean} [options.resetCursor=true] - Whether to reset the cursor position to the beginning of the line.
 * @param {boolean} [options.preserveLine=true] - Whether to preserve the current line of the output when resetting the cursor position.
 * @param {boolean} [options.clearLine=true] - Whether to clear the output line before printing.
 * @param {NodeJS.WritableStream} [options.output=process.stdout] - The output stream to print to.
 * @param {ReadLine} [options.readlineInterface] - The ReadLine interface to use for moving the cursor down.
 * @returns {void}
 */
export function print (str: string, options?: {
	/*
	 * Move down the input when printing
	*/
	resetCursor?: boolean
	preserveLine?: boolean
	clearLine?: boolean
	output?: NodeJS.WritableStream
	readlineInterface?: ReadLine
}): void {
	const {
		resetCursor = true, preserveLine = true,
		clearLine = true, output = process.stdout,
		readlineInterface
	} = options ?? {};

	if (resetCursor && clearLine) {
		clr(output, true);
	}

	// Print
	output.write('\r' + str);

	// Move down the chat prompt
	if (resetCursor) {
		output.write('\n');
		readlineInterface?.prompt(preserveLine);
	}
}

/**
 * A chat application that allows sending and receiving messages.
 */
export class Chat {
	/**
	 * The readline interface used to read input from the user.
	 */
	public readline: ReadLine;

	/**
	 * The event emitter for this class.
	 */
	public readonly events = new EventEmitter() as TypedEmitter<ChatEvents>;

	/**
	 * The options for the chat application.
	 */
	private readonly rlOpts: ReadLineOptions;

	/**
	 * Create a new instance of the Chat class.
	 *
	 * @param {ChatOptions} [options] - The options to use for the chat application.
	 */
	constructor (options?: ChatOptions) {
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

	/**
	 * Sends a message.
	 *
	 * @param {MsgData} data - The message data to send.
	 * @returns {boolean} Whether the message was sent or not.
	 */
	sendMsg (data: MsgData): boolean {
		return this.events.emit('msgSent', data);
	}

	/**
	 * Prints a message to the output stream.
	 *
	 * @param {string} str - The string to print.
	 * @param {{resetCursor?: boolean, preserveLine?: boolean, clearLine?: boolean}} [options] - The options for printing.
	 * @param {boolean} [options.resetCursor=true] - Whether to move the cursor to the start of the next line.
	 * @param {boolean} [options.preserveLine=true] - Whether to preserve the current line after printing.
	 * @param {boolean} [options.clearLine=true] - Whether to clear the current line before printing.
	 */
	print (str: string, options?: {
		/*
		 * Move down the input when printing
		*/
		resetCursor?: boolean
		preserveLine?: boolean
		clearLine?: boolean
	}): void {
		print(str, {
			...options,
			...{ output: this.rlOpts.output, readlineInterface: this.readline }
		});
	}
}
