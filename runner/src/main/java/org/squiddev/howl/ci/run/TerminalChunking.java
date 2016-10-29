package org.squiddev.howl.ci.run;

import dan200.computercraft.core.terminal.Terminal;
import dan200.computercraft.core.terminal.TextBuffer;
import org.squiddev.howl.ci.TRoRLogger;

import java.util.Arrays;

/**
 * A terminal which emits TRoR tokens
 */
public class TerminalChunking extends Terminal implements ComputerInstance.IComputerListener {
	private static final String[] COLORS = new String[]{
		"0", "1", "2", "3", "4", "5", "6", "7",
		"8", "9", "a", "b", "c", "d", "e", "f"
	};

	private final String id;
	private final TRoRLogger logger;

	private int cursorX = -1;
	private int cursorY = -1;
	private boolean cursorBlink = false;

	private int width = -1;
	private int height = -1;

	private TextBuffer[] text = new TextBuffer[0];
	private TextBuffer[] textColor = new TextBuffer[0];
	private TextBuffer[] backColor = new TextBuffer[0];

	public TerminalChunking(int width, int height, String id, TRoRLogger logger) {
		super(width, height);
		this.id = id;
		this.logger = logger;
	}

	@Override
	public synchronized void update(double dt) {
		if (!getChanged()) return;
		clearChanged();

		boolean forceFull = false;
		if (getWidth() != width || getHeight() != height) {
			width = getWidth();
			height = getHeight();

			logger.message("TR", id, width + "," + height);

			forceFull = true;

			text = new TextBuffer[height];
			textColor = new TextBuffer[height];
			backColor = new TextBuffer[height];

			for (int i = 0; i < height; i++) {
				text[i] = new TextBuffer(' ', width);
				textColor[i] = new TextBuffer(COLORS[getTextColour()], width);
				backColor[i] = new TextBuffer(COLORS[getBackgroundColour()], width);
			}
		}

		if (getCursorBlink() != cursorBlink) {
			cursorBlink = getCursorBlink();

			logger.message("TB", id, cursorBlink ? "true" : "false");
		}

		if (getCursorX() != cursorX || getCursorY() != cursorY) {
			cursorX = getCursorX();
			cursorY = getCursorY();

			logger.message("TC", id, (cursorX + 1) + "," + (cursorY + 1));
		}

		ChangeState[] changedRows = new ChangeState[height];
		int changedCount = 0;
		for (int y = 0; y < height; y++) {
			char[] oldText = getLine(y).m_text;
			char[] oldTextCol = getTextColourLine(y).m_text;
			char[] oldBackCol = getBackgroundColourLine(y).m_text;

			char[] newText = text[y].m_text;
			char[] newTextCol = textColor[y].m_text;
			char[] newBackCol = backColor[y].m_text;

			if (forceFull ||
				!Arrays.equals(oldText, newText) ||
				!Arrays.equals(oldTextCol, newTextCol) ||
				!Arrays.equals(oldBackCol, newBackCol)
				) {

				// We only need this information if we're not sending a full batch
				if (!forceFull) {
					int min = -1, max = -1;
					int len = oldText.length;

					for (int x = 0; x < len; x++) {
						boolean change = oldText[x] != newText[x] ||
							oldTextCol[x] != newTextCol[x] ||
							oldBackCol[x] != newBackCol[x];

						if (change) {
							if (min == -1) min = x;
							max = x + 1;
						}
					}
					changedRows[y] = new ChangeState(min, max);
				}

				System.arraycopy(oldText, 0, newText, 0, Math.min(oldText.length, newText.length));
				System.arraycopy(oldTextCol, 0, newTextCol, 0, Math.min(oldTextCol.length, newTextCol.length));
				System.arraycopy(oldBackCol, 0, newBackCol, 0, Math.min(oldBackCol.length, newBackCol.length));

				changedCount++;
			}
		}

		// If we're forcing or most lines have changed write the entire terminal
		if (forceFull || changedCount > height * 3 / 2) {
			StringBuilder buffer = new StringBuilder(height * (width + 1) * 3 - 1);
			for (int y = 0; y < height; y++) {
				if (y > 0) buffer.append(':');

				buffer.append(textColor[y].m_text);
				buffer.append(',');
				buffer.append(backColor[y].m_text);
				buffer.append(',');
				writeTextBuffer(buffer, text[y].m_text);
			}

			logger.message("TV", id, buffer.toString());
		} else if (changedCount > 0) {
			for (int y = 0; y < height; y++) {
				ChangeState state = changedRows[y];
				if (state != null) {
					StringBuilder buffer = new StringBuilder(state.len * 3 + 8);
					buffer.append(state.min + 1);
					buffer.append(',');
					buffer.append(y + 1);
					buffer.append(',');
					buffer.append(textColor[y].m_text, state.min, state.len);
					buffer.append(',');
					buffer.append(backColor[y].m_text, state.min, state.len);
					buffer.append(',');
					writeTextBuffer(buffer, text[y].m_text, state.min, state.len);

					logger.message("TZ", id, buffer.toString());
				}
			}
		}
	}

	@Override
	public void close() {
		logger.message("SC", id, "Closed");
	}

	private static void writeTextBuffer(StringBuilder buffer, char[] data) {
		writeTextBuffer(buffer, data, 0, data.length);
	}

	private static void writeTextBuffer(StringBuilder buffer, char[] data, int start, int finish) {
		for (int i = start; i < start + finish; i++) {
			char b = data[i];
			// Replace with space if contains a new line
			buffer.append((b == '\n' ? ' ' : b));
		}
	}

	private static class ChangeState {
		public final int min;
		public final int len;

		private ChangeState(int min, int len) {
			this.min = min;
			this.len = len;
		}
	}


	//region synchronized methods
	@Override
	public synchronized void resize(int width, int height) {
		super.resize(width, height);
	}

	@Override
	public synchronized void blit(String text, String textColour, String backgroundColour) {
		super.blit(text, textColour, backgroundColour);
	}

	@Override
	public synchronized void write(String text) {
		super.write(text);
	}

	@Override
	public synchronized void scroll(int yDiff) {
		super.scroll(yDiff);
	}

	@Override
	public synchronized void clear() {
		super.clear();
	}

	@Override
	public synchronized void clearLine() {
		super.clearLine();
	}
	//endregion
}
