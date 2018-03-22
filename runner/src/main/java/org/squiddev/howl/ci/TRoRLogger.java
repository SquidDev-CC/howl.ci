package org.squiddev.howl.ci;

import java.io.PrintStream;

public class TRoRLogger {
	public static final String CORE_ID = "core";

	private static final String EXTENSION_LOG = "XL";
	private static final String EXTENSION_STATUS = "XS";

	private final PrintStream stream;
	private Status status = Status.NONE;

	public TRoRLogger(PrintStream stream) {
		this.stream = stream;
	}

	public void message(String code, String id, String data) {
		assert code.length() == 2 : "code must be two characters";
		assert code.indexOf('\n') == -1 : "code cannot contain \\n";
		assert id.indexOf('\n') == -1 : "id cannot contain \\n";
		assert data.indexOf('\n') == -1 : "data cannot contain \\n";

		stream.print(code + ":" + id + "," + System.nanoTime() + ";" + data + "\n");
		stream.flush();
	}

	public void log(String id, String level, String message) {
		message(EXTENSION_LOG, id, level.toLowerCase().replaceAll("[^\\w-]", "") + "," + normaliseLines(message));
	}

	public void debug(String id, String message) {
		log(id, "debug", normaliseLines(message));
	}

	public void warn(String id, String message) {
		log(id, "warn", normaliseLines(message));
	}

	public void error(String id, String message) {
		log(id, "error", normaliseLines(message));
	}

	public void error(String id, String message, Throwable e) {
		if (e == null) {
			error(id, message);
		} else {
			error(id, message + ": " + e);
		}
	}

	public void status(String id, Status status, String message) {
		message(EXTENSION_STATUS, id, status.name().toLowerCase() + "," + message.replace('\n', '\r'));

		if (status.ordinal() > this.status.ordinal()) this.status = status;
	}

	public Status getStatus() {
		return status;
	}

	public enum Status {
		NONE,
		SUCCESS,
		FAILURE,
		ERROR,
	}

	private static String normaliseLines(String text) {
		return text.replace("\r\n", "\r").replace('\n', '\r');
	}
}
