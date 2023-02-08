/**
 * Clears the current line of text and returns to the start of that line if `StartOfLine` is true.
 *
 * @param startOfLine Reset to line start
 */
export const clearLine = (output: NodeJS.WritableStream, startOfLine = false): void => {
	output.write('\x1b[2K');
	if (startOfLine) output.write('\r');
};
