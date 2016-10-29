package org.squiddev.howl.ci;

import java.io.PrintStream;

public class TRoRLogger {
	public static final String CORE_ID = "core";

	private static final String EXTENSION_DEBUG = "XD";
	private static final String EXTENSION_WARN = "XW";
	private static final String EXTENSION_ERROR = "XE";
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

	public void debug(String id, String message) {
		message(EXTENSION_DEBUG, id, message.replace('\n', '\r'));
	}

	public void warn(String id, String message) {
		message(EXTENSION_WARN, id, message.replace('\n', '\r'));
	}

	public void error(String id, String message) {
		message(EXTENSION_ERROR, id, message.replace('\n', '\r'));
	}

	public void error(String id, String message, Throwable e) {
		if (e == null) {
			message(EXTENSION_ERROR, id, message.replace('\n', '\r'));
		} else {
			message(EXTENSION_ERROR, id, (message + ": " + e.toString()).replace('\n', '\r'));
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
}
