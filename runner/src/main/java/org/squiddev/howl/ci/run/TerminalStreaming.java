package org.squiddev.howl.ci.run;

import dan200.computercraft.core.terminal.Terminal;
import dan200.computercraft.shared.util.Palette;
import org.squiddev.howl.ci.TRoRLogger;

import java.text.DecimalFormat;

/**
 * A terminal which emits TRoR tokens
 */
public class TerminalStreaming extends Terminal implements ComputerInstance.IComputerListener {
	private static final String[] COLORS = new String[]{
		"0", "1", "2", "3", "4", "5", "6", "7",
		"8", "9", "a", "b", "c", "d", "e", "f"
	};

	private static final DecimalFormat PALETTE_FORMAT;

	static {
		PALETTE_FORMAT = new DecimalFormat();
		PALETTE_FORMAT.setMaximumFractionDigits(3);
	}

	private final String id;
	private final TRoRLogger logger;
	private final LoggingPalette palette;

	public TerminalStreaming(int width, int height, String id, TRoRLogger logger) {
		super(width, height);
		this.id = id;
		this.logger = logger;
		this.palette = new LoggingPalette();

		logger.message("TR", id, width + "," + height);
		logger.message("TC", id, (getCursorX() + 1) + "," + (getCursorY() + 1));
	}

	@Override
	public void resize(int width, int height) {
		super.resize(width, height);
		if (getChanged()) {
			clearChanged();
			logger.message("TR", id, width + "," + height);
		}
	}

	@Override
	public void setCursorPos(int x, int y) {
		super.setCursorPos(x, y);
		if (getChanged()) {
			clearChanged();
			logger.message("TC", id, (x + 1) + "," + (y + 1));
		}
	}

	@Override
	public void setCursorBlink(boolean blink) {
		super.setCursorBlink(blink);
		if (getChanged()) {
			clearChanged();
			logger.message("TB", id, blink ? "true" : "false");
		}
	}

	@Override
	public void setTextColour(int colour) {
		super.setTextColour(colour);
		if (getChanged()) {
			clearChanged();
			logger.message("TF", id, COLORS[colour]);
		}
	}

	@Override
	public void setBackgroundColour(int colour) {
		super.setBackgroundColour(colour);
		if (getChanged()) {
			clearChanged();
			logger.message("TB", id, COLORS[colour]);
		}
	}

	@Override
	public void blit(String text, String foreColour, String backgroundColour) {
		super.blit(text, foreColour, backgroundColour);
		if (getChanged()) {
			clearChanged();
			logger.message("TY", id, foreColour + "," + backgroundColour + "," + text.replace('\n', ' '));
		}
	}

	@Override
	public void write(String text) {
		super.write(text);
		if (getChanged()) {
			clearChanged();
			logger.message("TW", id, text.replace('\n', ' '));
		}
	}

	@Override
	public void scroll(int yDiff) {
		super.scroll(yDiff);
		if (getChanged()) {
			clearChanged();
			logger.message("TS", id, Integer.toString(yDiff));
		}
	}

	@Override
	public void clear() {
		super.clear();
		if (getChanged()) {
			clearChanged();
			logger.message("TE", id, "");
		}
	}

	@Override
	public void clearLine() {
		super.clearLine();
		if (getChanged()) {
			clearChanged();
			logger.message("TL", id, "");
		}
	}

	@Override
	public Palette getPalette() {
		return palette;
	}

	@Override
	public void update(double dt) {
	}

	@Override
	public void close() {
		logger.message("SC", id, "Closed");
	}

	private class LoggingPalette extends Palette {
		private boolean initialised;

		LoggingPalette() {
			initialised = true;
		}

		@Override
		public void setColour(int i, double r, double g, double b) {
			double[] current = getColour(i);
			if (current == null) return;

			// Only update the palette once the class has been updated, so initial palettes don't
			// do anything
			if (initialised && (current[0] != r || current[1] != g || current[2] != b)) {
				logger.message("TM", id, String.format("%s,%s,%s,%s",
					COLORS[15 - i], PALETTE_FORMAT.format(r), PALETTE_FORMAT.format(g), PALETTE_FORMAT.format(b)));
			}

			super.setColour(i, r, g, b);
		}
	}
}
