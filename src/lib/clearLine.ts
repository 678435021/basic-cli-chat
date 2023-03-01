/**
 * Clears the current line in the output stream and optionally moves the cursor to the start of the line.
 *
 * @param {NodeJS.WritableStream} output - The output stream to clear the line from.
 * @param {boolean} [startOfLine=false] - Whether to move the cursor to the start of the line after clearing it.
 *
 * @returns {void}
 */
export const clearLine = (output: NodeJS.WritableStream, startOfLine = false): void => {
	output.write('\x1b[2K');
	if (startOfLine) output.write('\r');
};
